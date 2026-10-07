/* @layer store-site @kind logic */
/**
 * Markdown to HTML for the welcome message and item descriptions. Raw HTML in the source is
 * dropped, and a link keeps its target only when it is http, https or mailto, so a message
 * cannot run script on the page. Links open in a new tab.
 */
import { Marked } from 'marked';

const SAFE_HREF = /^(https?:|mailto:)/i;

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const markdown = new Marked({
  async: false,
  renderer: {
    html: () => '',
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      if (!SAFE_HREF.test(href)) return text;
      return `<a href="${escapeAttr(href)}" target="_blank" rel="noreferrer">${text}</a>`;
    },
    image: ({ text }) => escapeAttr(text),
  },
});

const renderMarkdown = (source: string): string => markdown.parse(source) as string;

export { renderMarkdown };
