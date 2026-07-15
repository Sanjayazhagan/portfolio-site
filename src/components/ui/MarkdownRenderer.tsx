"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "./Mermaid";
import { ClassAttributes, HTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
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
