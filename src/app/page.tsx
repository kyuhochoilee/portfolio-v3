import HomeLayout from "@/components/HomeLayout";
import BlogPostContent from "@/components/BlogPostContent";
import ProjectContent from "@/components/ProjectContent";
import {
  getProjects as getMdxProjects,
  getBlogPosts as getMdxPosts,
  getProject as getMdxProject,
} from "@/lib/content";
import {
  getProjects as getSanityProjects,
  getPosts as getSanityPosts,
  urlFor,
} from "@/lib/sanity";
import type { ProjectMeta, PostMeta } from "@/lib/content";

export const revalidate = 60; // ISR: revalidate every 60s

export default async function Home() {
  // Try Sanity first, fall back to MDX files
  let projects: ProjectMeta[];
  let posts: PostMeta[];

  try {
    const sanityProjects = await getSanityProjects();
    if (sanityProjects.length > 0) {
      projects = sanityProjects.map((p) => ({
        slug: p.slug.current,
        title: p.title,
        description: p.description ?? "",
        featuredImage: p.featuredVideo
          ? p.featuredVideo
          : p.featuredImage
            ? urlFor(p.featuredImage).width(800).url()
            : "",
        headerImage: p.headerImage
          ? urlFor(p.headerImage).width(1200).url()
          : undefined,
        tags: p.tags ?? [],
        link: p.link,
        role: p.role,
        tools: p.tools,
        timeline: p.timeline,
      }));
    } else {
      projects = getMdxProjects();
    }
  } catch {
    projects = getMdxProjects();
  }

  try {
    const sanityPosts = await getSanityPosts();
    if (sanityPosts.length > 0) {
      posts = sanityPosts.map((p) => ({
        slug: p.slug.current,
        title: p.title,
        description: p.description ?? "",
        date: p.date,
        image: p.image ? urlFor(p.image).width(800).url() : undefined,
        tags: p.tags,
        readingTime: "",
      }));
    } else {
      posts = getMdxPosts();
    }
  } catch {
    posts = getMdxPosts();
  }

  // Pre-render MDX blog content for inline expansion
  const mdxPosts = getMdxPosts();
  const blogContent: Record<string, React.ReactNode> = {};
  for (const post of mdxPosts) {
    blogContent[post.slug] = (
      <BlogPostContent key={post.slug} slug={post.slug} />
    );
  }

  // Pre-render project content
  const mdxProjects = getMdxProjects();
  const projectContent: Record<string, React.ReactNode> = {};
  for (const project of mdxProjects) {
    const full = getMdxProject(project.slug);
    if (full) {
      projectContent[project.slug] = (
        <ProjectContent key={project.slug} slug={project.slug} />
      );
    }
  }

  return (
    <HomeLayout projects={projects} posts={posts} blogContent={blogContent} projectContent={projectContent} />
  );
}
