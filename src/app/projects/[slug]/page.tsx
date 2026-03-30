import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
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

  return (
    <Container
      as="article"
      style={{ paddingTop: "var(--header-safe)", paddingBottom: "var(--footer-safe)", fontFamily: "var(--font-display)" }}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg transition-colors mb-8"
      >
        &larr; back
      </Link>

      {meta.headerImage && (
        <img
          src={meta.headerImage}
          alt=""
          className="w-full rounded-[var(--radius-lg)] mb-8"
        />
      )}

      <header className="mb-8 max-w-2xl">
        <h1
          className="text-2xl tracking-tight leading-tight mb-2"
          style={{ color: "var(--color-orange)" }}
        >
          {meta.title.toLowerCase()}
        </h1>
        {meta.description && (
          <p className="text-base text-muted mb-4">{meta.description.toLowerCase()}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
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

        <div className="flex flex-wrap gap-6 text-sm border-t border-border pt-4">
          {meta.role && (
            <div>
              <span className="text-muted uppercase tracking-wide text-xs">
                role
              </span>
              <p className="text-fg">{meta.role.toLowerCase()}</p>
            </div>
          )}
          {meta.tools && meta.tools.length > 0 && (
            <div>
              <span className="text-muted uppercase tracking-wide text-xs">
                tools
              </span>
              <p className="text-fg">{meta.tools.join(", ").toLowerCase()}</p>
            </div>
          )}
          {meta.timeline && (
            <div>
              <span className="text-muted uppercase tracking-wide text-xs">
                timeline
              </span>
              <p className="text-fg">{meta.timeline.toLowerCase()}</p>
            </div>
          )}
        </div>
      </header>

      <MdxContent source={content} />
    </Container>
  );
}
