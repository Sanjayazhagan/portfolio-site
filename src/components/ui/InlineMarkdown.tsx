import ReactMarkdown from "react-markdown";

// Short descriptions are written in Markdown in the admin, but they sit inside a single
// paragraph, so only inline formatting is rendered (headings, lists, images etc. are dropped).
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      allowedElements={["p", "strong", "em", "code", "a"]}
      unwrapDisallowed
      components={{
        // The card/paragraph that wraps this is already a <p>
        p: ({ children }) => <>{children}</>,
        strong: ({ children }) => <strong className="font-semibold text-slate-200">{children}</strong>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline underline-offset-2">
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
