import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "";
const WRITE_PASSWORD = process.env.WRITE_PASSWORD ?? "";
const UPLOAD_PATH = "public/images/uploads";
const MAX_WIDTH = 1600;
const QUALITY = 80;

export async function POST(req: NextRequest) {
  const pw = req.headers.get("x-write-password");
  if (pw !== WRITE_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;
  const url = `/images/uploads/${name}`;

  // Compress and convert to webp
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const isHeader = formData.get("header") === "true";
  const resizeOpts = isHeader
    ? { width: MAX_WIDTH, height: Math.round(MAX_WIDTH * 10 / 16), fit: "cover" as const, withoutEnlargement: true }
    : { width: MAX_WIDTH, withoutEnlargement: true };

  const compressed = await sharp(rawBuffer)
    .resize(resizeOpts)
    .webp({ quality: QUALITY })
    .toBuffer();

  // Save locally first so it works immediately in dev
  try {
    const localDir = path.join(process.cwd(), UPLOAD_PATH);
    fs.mkdirSync(localDir, { recursive: true });
    fs.writeFileSync(path.join(localDir, name), compressed);
  } catch (e) {
    console.error("Local save failed:", e);
  }

  // Also upload to GitHub (best effort)
  if (GITHUB_TOKEN && GITHUB_REPO) {
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${UPLOAD_PATH}/${name}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `upload: ${name}`,
          content: compressed.toString("base64"),
        }),
      });
      if (!res.ok) {
        console.error("GitHub upload failed:", await res.text());
      }
    } catch (e) {
      console.error("GitHub upload error:", e);
    }
  }

  return NextResponse.json({ url });
}
