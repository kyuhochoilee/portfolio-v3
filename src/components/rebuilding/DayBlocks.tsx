import Image from "next/image";

/* eslint-disable @typescript-eslint/no-explicit-any */

function richText(rt: any[] | undefined): string {
  if (!rt) return "";
  return rt.map((t: any) => t.plain_text || "").join("");
}

function Block({ block }: { block: any }) {
  const t = block.type as string;
  const data = block[t];

  if (t === "paragraph") {
    const text = richText(data?.rich_text);
    if (!text.trim()) return null;
    return <p className="rb-block-p">{text}</p>;
  }

  if (t === "heading_1" || t === "heading_2" || t === "heading_3") {
    return <div className="rb-block-h">{richText(data?.rich_text)}</div>;
  }

  if (t === "to_do") {
    return (
      <div className={`rb-todo ${data.checked ? "rb-todo-done" : ""}`}>
        <span className="rb-todo-box">{data.checked ? "✓" : ""}</span>
        <span className="rb-todo-text">{richText(data.rich_text)}</span>
        {block.children && block.children.length > 0 && (
          <div className="rb-todo-children">
            {block.children.map((c: any) => (
              <Block key={c.id} block={c} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (t === "bulleted_list_item" || t === "numbered_list_item") {
    return (
      <div className="rb-bullet">
        <span className="rb-bullet-mark">•</span>
        <span>{richText(data.rich_text)}</span>
      </div>
    );
  }

  if (t === "image") {
    const url = data?.file?.url || data?.external?.url;
    if (!url) return null;
    const caption = richText(data?.caption);
    return (
      <div className="rb-block-image">
        <div className="rb-block-image-frame">
          <Image src={url} alt={caption || "image"} width={800} height={1000} className="rb-img" />
        </div>
        {caption && <div className="rb-block-caption">{caption}</div>}
      </div>
    );
  }

  if (t === "toggle") {
    const title = richText(data?.rich_text);
    return (
      <div className="rb-block">
        <div className="rb-block-head">{title}</div>
        {block.children && block.children.length > 0 ? (
          <div className="rb-block-body">
            {block.children.map((c: any) => (
              <Block key={c.id} block={c} />
            ))}
          </div>
        ) : (
          <p className="rb-block-empty">empty</p>
        )}
      </div>
    );
  }

  if (t === "divider") {
    return <hr className="rb-block-divider" />;
  }

  if (t === "quote") {
    return <blockquote className="rb-block-quote">{richText(data?.rich_text)}</blockquote>;
  }

  return null;
}

export default function DayBlocks({ blocks }: { blocks: any[] }) {
  return (
    <div className="rb-blocks">
      {blocks.map((b) => (
        <Block key={b.id} block={b} />
      ))}
    </div>
  );
}
