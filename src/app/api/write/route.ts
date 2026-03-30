import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "";
const WRITE_PASSWORD = process.env.WRITE_PASSWORD ?? "";
const BLOG_PATH = "src/content/thoughts";

// Rate limit auth attempts: 10 per minute per IP
const authAttempts = new Map<string, { count: number; resetAt: number }>();

function getIP(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

function authCheck(req: NextRequest) {
  const ip = getIP(req);
  const now = Date.now();
  const entry = authAttempts.get(ip);
  if (entry && now < entry.resetAt && entry.count >= 10) {
    return NextResponse.json({ error: "too many attempts" }, { status: 429 });
  }
  if (!entry || now > entry.resetAt) {
    authAttempts.set(ip, { count: 1, resetAt: now + 60000 });
  } else {
    entry.count++;
  }

  const pw = req.headers.get("x-write-password");
  if (pw !== WRITE_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

function validateSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) && !slug.includes("..");
}

async function ghFetch(path: string, options?: RequestInit) {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  return res;
}

// GET — list all posts or get a specific one
export async function GET(req: NextRequest) {
  const authErr = authCheck(req);
  if (authErr) return authErr;

  const slug = req.nextUrl.searchParams.get("slug");

  if (slug) {
    if (!validateSlug(slug)) return NextResponse.json({ error: "invalid slug" }, { status: 400 });
    const res = await ghFetch(`contents/${BLOG_PATH}/${slug}.mdx`);
    if (!res.ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    const data = await res.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return NextResponse.json({ slug, content, sha: data.sha });
  }

  // List all blog files with metadata
  const res = await ghFetch(`contents/${BLOG_PATH}`);
  if (!res.ok) return NextResponse.json({ error: "failed to list" }, { status: 500 });
  const files = await res.json();

  const posts = await Promise.all(
    files
      .filter((f: { name: string }) => f.name.endsWith(".mdx"))
      .map(async (f: { name: string; sha: string; download_url: string }) => {
        const slug = f.name.replace(/\.mdx$/, "");
        // Try to read frontmatter from local file first (faster)
        let title = slug;
        let date = "";
        let description = "";
        let draft = false;
        try {
          const localPath = path.join(process.cwd(), BLOG_PATH, f.name);
          if (fs.existsSync(localPath)) {
            const raw = fs.readFileSync(localPath, "utf-8");
            const fm = raw.match(/^---\n([\s\S]*?)\n---/);
            if (fm) {
              title = fm[1].match(/title:\s*"?([^"\n]*)"?/)?.[1] || slug;
              date = fm[1].match(/date:\s*(\S+)/)?.[1] || "";
              description = fm[1].match(/description:\s*"?([^"\n]*)"?/)?.[1] || "";
              draft = /draft:\s*true/.test(fm[1]);
            }
          }
        } catch { /* fallback to slug */ }
        return { slug, sha: f.sha, title, date, description, draft };
      })
  );

  // Sort by date descending
  posts.sort((a: { date: string }, b: { date: string }) => (b.date || "").localeCompare(a.date || ""));
  return NextResponse.json({ posts });
}

// POST — create or update a post
export async function POST(req: NextRequest) {
  const authErr = authCheck(req);
  if (authErr) return authErr;

  const { slug, content, sha } = await req.json();
  if (!slug || !content) {
    return NextResponse.json({ error: "slug and content required" }, { status: 400 });
  }
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  if (content.length > 1000000) {
    return NextResponse.json({ error: "content too large" }, { status: 413 });
  }

  const filePath = `${BLOG_PATH}/${slug}.mdx`;
  const encoded = Buffer.from(content).toString("base64");

  const body: Record<string, string> = {
    message: sha ? `update: ${slug}` : `new post: ${slug}`,
    content: encoded,
  };
  if (sha) body.sha = sha;

  const res = await ghFetch(`contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.message }, { status: res.status });
  }

  const result = await res.json();
  const newSha = result.content?.sha;

  // Also save locally so it shows up immediately in dev
  try {
    const localPath = path.join(process.cwd(), BLOG_PATH, `${slug}.mdx`);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, content, "utf-8");
  } catch {
    // Local write is best-effort — GitHub is the source of truth
  }

  return NextResponse.json({ ok: true, slug, sha: newSha });
}

// DELETE — delete a post
export async function DELETE(req: NextRequest) {
  const authErr = authCheck(req);
  if (authErr) return authErr;

  const { slug, sha } = await req.json();
  if (!slug || !sha) {
    return NextResponse.json({ error: "slug and sha required" }, { status: 400 });
  }
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  const delPath = `${BLOG_PATH}/${slug}.mdx`;
  const res = await ghFetch(`contents/${delPath}`, {
    method: "DELETE",
    body: JSON.stringify({ message: `delete: ${slug}`, sha }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.message }, { status: res.status });
  }

  // Also delete locally
  try {
    const localPath = path.join(process.cwd(), BLOG_PATH, `${slug}.mdx`);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  } catch {
    // best-effort
  }

  return NextResponse.json({ ok: true });
}
