import MdxContent from "@/components/MdxContent";
import { getBlogPost } from "@/lib/content";

export default function BlogPostContent({ slug }: { slug: string }) {
  const post = getBlogPost(slug);
  if (!post) return null;

  return (
    <div
      className="w-full pb-12"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <MdxContent source={post.content} />
    </div>
  );
}
