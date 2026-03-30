import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any;

export const client = createClient({
  projectId: "m0qov5ij",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Types
export interface SanityProject {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  featuredImage?: SanityImageSource;
  featuredVideo?: string;
  headerImage?: SanityImageSource;
  tags?: string[];
  link?: string;
  role?: string;
  tools?: string[];
  timeline?: string;
  order?: number;
  published: boolean;
  body?: unknown[];
}

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  date: string;
  image?: SanityImageSource;
  tags?: string[];
  published: boolean;
  body?: unknown[];
}

// Queries
export async function getProjects(): Promise<SanityProject[]> {
  return client.fetch(
    `*[_type == "project" && published == true] | order(order asc) {
      _id, title, slug, description, featuredImage, featuredVideo,
      headerImage, tags, link, role, tools, timeline, order, published, body
    }`
  );
}

export async function getProject(slug: string): Promise<SanityProject | null> {
  return client.fetch(
    `*[_type == "project" && slug.current == $slug && published == true][0] {
      _id, title, slug, description, featuredImage, featuredVideo,
      headerImage, tags, link, role, tools, timeline, order, published, body
    }`,
    { slug }
  );
}

export async function getPosts(): Promise<SanityPost[]> {
  return client.fetch(
    `*[_type == "post" && published == true] | order(date desc) {
      _id, title, slug, description, date, image, tags, published, body
    }`
  );
}

export async function getPost(slug: string): Promise<SanityPost | null> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug && published == true][0] {
      _id, title, slug, description, date, image, tags, published, body
    }`,
    { slug }
  );
}
