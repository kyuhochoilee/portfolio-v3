import HomeLayout from "@/components/HomeLayout";
import BlogPostContent from "@/components/BlogPostContent";
import ProjectContent from "@/components/ProjectContent";
import {
  getProjects,
  getBlogPosts,
  getProject,
} from "@/lib/content";
import type { ProjectMeta } from "@/lib/content";
import { isThoughtsUnlocked } from "@/lib/thoughtsAuth";

export default async function Home() {
  const projects: ProjectMeta[] = getProjects();
  const posts = getBlogPosts();
  const thoughtsUnlocked = await isThoughtsUnlocked();

  // Sort projects into preferred display order
  const PROJECT_ORDER = ["clique", "speak", "nothing", "keynotes", "zine", "paradigm", "thoughts", "isteam"];
  projects.sort((a, b) => {
    const ai = PROJECT_ORDER.indexOf(a.slug);
    const bi = PROJECT_ORDER.indexOf(b.slug);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  // Pre-render MDX blog content for inline expansion. Only emit content when
  // the thoughts section is unlocked — otherwise the timeline shows and the
  // password prompt takes the place of the article body.
  const blogContent: Record<string, React.ReactNode> = {};
  if (thoughtsUnlocked) {
    for (const post of posts) {
      blogContent[post.slug] = (
        <BlogPostContent key={post.slug} slug={post.slug} />
      );
    }
  }

  // Pre-render project content
  const projectContent: Record<string, React.ReactNode> = {};
  for (const project of projects) {
    const full = getProject(project.slug);
    if (full) {
      projectContent[project.slug] = (
        <ProjectContent key={project.slug} slug={project.slug} />
      );
    }
  }

  return (
    <HomeLayout
      projects={projects}
      posts={posts}
      blogContent={blogContent}
      projectContent={projectContent}
      thoughtsUnlocked={thoughtsUnlocked}
    />
  );
}
