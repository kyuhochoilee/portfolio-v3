import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";

const components = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, alt } = props;
    if (!src || typeof src !== "string") return null;

    // Use Next.js Image for local images, regular img for external
    if (src.startsWith("/")) {
      return (
        <Image
          src={src}
          alt={alt ?? ""}
          width={1200}
          height={800}
          quality={70}
          sizes="(max-width: 768px) 100vw, 42rem"
          className="rounded-[var(--radius-md)]"
        />
      );
    }

    /* eslint-disable @next/next/no-img-element */
    return <img src={src} alt={alt ?? ""} />;
  },
};

interface MdxContentProps {
  source: string;
}

export default function MdxContent({ source }: MdxContentProps) {
  return (
    <div className="prose">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
