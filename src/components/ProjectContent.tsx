import MdxContent from "@/components/MdxContent";
import { getProject } from "@/lib/content";

export default function ProjectContent({ slug }: { slug: string }) {
  const project = getProject(slug);
  if (!project) return null;

  return (
    <div
      className="w-full pb-12"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <MdxContent source={project.content} />
    </div>
  );
}
