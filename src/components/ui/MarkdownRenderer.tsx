"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "./Mermaid";
import { ClassAttributes, HTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";

type MdNode = { type: string; depth?: number; children?: MdNode[] };

// The page already has an h1, so shift the content's headings until the top level is h2,
// whatever level the author started at (keeps the outline valid for screen readers).
function remarkNestHeadings() {
  return (tree: MdNode) => {
    const headings: MdNode[] = [];
    const walk = (node: MdNode) => {
      if (node.type === "heading") headings.push(node);
      node.children?.forEach(walk);
    };
    walk(tree);
    if (headings.length === 0) return;
    const shift = 2 - Math.min(...headings.map((h) => h.depth ?? 2));
    for (const h of headings) h.depth = Math.min(6, Math.max(2, (h.depth ?? 2) + shift));
  };
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkNestHeadings]}
      components={{
        code({
          node,
          inline,
          className,
          children,
          ...props
        }: ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps & { inline?: boolean }) {
          const match = /language-(\w+)/.exec(className || "");
          if (!inline && match && match[1] === "mermaid") {
            return <Mermaid chart={String(children).replace(/\n$/, "")} />;
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
