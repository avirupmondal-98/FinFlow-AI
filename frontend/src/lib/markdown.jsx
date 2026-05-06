// Safely render a tiny slice of markdown: headings (##), bold (**...**), bullets (-).
// Uses pure React rendering — never dangerouslySetInnerHTML — so user / LLM-supplied
// markdown can never inject script tags or arbitrary HTML.
import React from "react";

function renderInline(text, baseKey) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${baseKey}-b-${i}`}>{part}</strong>
    ) : (
      <React.Fragment key={`${baseKey}-t-${i}`}>{part}</React.Fragment>
    )
  );
}

export default function renderMarkdown(md) {
  if (!md) return null;
  const lines = md.split(/\r?\n/);
  const out = [];
  let listBuf = [];
  const flush = () => {
    if (listBuf.length) {
      out.push(<ul key={`ul-${out.length}`}>{listBuf}</ul>);
      listBuf = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      return;
    }
    if (line.startsWith("## ")) {
      flush();
      out.push(<h2 key={`h2-${i}`}>{line.slice(3)}</h2>);
      return;
    }
    if (line.startsWith("### ")) {
      flush();
      out.push(<h3 key={`h3-${i}`}>{line.slice(4)}</h3>);
      return;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuf.push(<li key={`li-${i}`}>{renderInline(line.slice(2), `li-${i}`)}</li>);
      return;
    }
    flush();
    out.push(<p key={`p-${i}`}>{renderInline(line, `p-${i}`)}</p>);
  });
  flush();
  return out;
}
