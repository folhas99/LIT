import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitises admin-authored HTML before it's rendered via
 * dangerouslySetInnerHTML. The admin is trusted, but a compromised account
 * (or a stored XSS pivoting through a text field) would otherwise execute on
 * every visitor — so we strip scripts and event handlers up front.
 *
 * Allow-list is deliberately generous to keep the rich-text editor output
 * intact: headings, lists, links, emphasis, tables, images, code.
 */
const ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "dd",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "class",
  "id",
  "style",
  "loading",
  "width",
  "height",
];

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Force target="_blank" links to get rel=noopener so they can't
    // reach window.opener.
    ADD_ATTR: ["target"],
  });
}
