import React, { useMemo } from "react";
import "./JsonViewer.css";

export interface JsonViewerProps {
  json: unknown;
  className?: string;
}

// Lightweight JSON highlighter without external deps
function highlightJson(jsonString: string): string {
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const tokenized = escapeHtml(jsonString)
    // keys
    .replace(/("(\\.|[^"\\])*")\s*:/g, (_match, p1) => {
      return `<span class=\"token-key\">${p1}</span>:`;
    })
    // strings
    .replace(/:"(\\.|[^"\\])*"/g, (m) => {
      const value = m.slice(1); // keep leading :
      return `:<span class=\"token-string\">${value}</span>`;
    })
    // numbers
    .replace(/:(\s*)(-?\d+(?:\.\d+)?)/g, (_m, s, n) => `:${s}<span class=\"token-number\">${n}</span>`)
    // booleans
    .replace(/:(\s*)(true|false)/g, (_m, s, b) => `:${s}<span class=\"token-boolean\">${b}</span>`)
    // null
    .replace(/:(\s*)(null)/g, (_m, s, n) => `:${s}<span class=\"token-null\">${n}</span>`);

  return tokenized;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ json, className }) => {
  const pretty = useMemo(() => {
    try {
      const text = typeof json === "string" ? json : JSON.stringify(json, null, 2);
      const parsed = JSON.stringify(JSON.parse(text || "{}"), null, 2);
      return highlightJson(parsed);
    } catch {
      const text = typeof json === "string" ? json : JSON.stringify(json, null, 2);
      return highlightJson(text);
    }
  }, [json]);

  return (
    <pre className={`json-viewer ${className || ""}`} dangerouslySetInnerHTML={{ __html: pretty }} />
  );
};

export default JsonViewer;


