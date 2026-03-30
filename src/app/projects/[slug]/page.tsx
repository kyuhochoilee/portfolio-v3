import { notFound } from "next/navigation";
import { Metadata } from "next";
import MdxContent from "@/components/MdxContent";
import { getProject, getProjects } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.meta.title,
    description: project.meta.description,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { meta, content } = project;

  const formattedTimeline = meta.timeline?.toLowerCase() || "";

  return (
    <article
      style={{ paddingTop: "var(--header-safe)", paddingBottom: "var(--footer-safe)", fontFamily: "var(--font-display)" }}
    >
      {/* Post header — same structure as thoughts */}
      <div className="flex justify-center" style={{ padding: "0 1.5rem" }}>
        <div style={{ width: "33rem", maxWidth: "100%" }}>
          {/* Header image */}
          {meta.headerImage && (
            <div className="relative aspect-[16/10] mb-6 overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
              <img
                src={meta.headerImage}
                alt={meta.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title — centered */}
          <h1 className="subheading text-center" style={{ paddingBottom: "0.5rem" }}>
            {meta.title.toLowerCase()}
          </h1>

          {/* Description — centered */}
          {meta.description && (
            <p className="text-muted text-sm text-center" style={{ paddingBottom: "0.5rem" }}>
              {meta.description.toLowerCase()}
            </p>
          )}

          {/* Metadata — centered */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
            {meta.role && <span>{meta.role.toLowerCase()}</span>}
            {meta.role && formattedTimeline && <span>·</span>}
            {formattedTimeline && <span>{formattedTimeline}</span>}
          </div>

          {/* Tags + link — centered */}
          {(meta.tags.length > 0 || meta.link) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs"
                  style={{ color: "var(--color-purple)" }}
                >
                  #{tag.toLowerCase()}
                </span>
              ))}
              {meta.link && (
                <a
                  href={meta.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline transition-colors"
                  style={{ color: "var(--color-purple)" }}
                >
                  view project &rarr;
                </a>
              )}
            </div>
          )}

          {/* Divider */}
          <div
            className="mx-auto"
            style={{
              width: "3rem",
              height: "1px",
              background: "var(--color-border)",
              marginTop: "1.5rem",
              marginBottom: "1.5rem",
            }}
          />
        </div>
      </div>

      {/* Body — same width as thoughts */}
      <div className="flex justify-center" style={{ padding: "0 1.5rem" }}>
        <div style={{ width: "33rem", maxWidth: "100%" }}>
          <MdxContent source={content} />
        </div>
      </div>
    </article>
  );
}
