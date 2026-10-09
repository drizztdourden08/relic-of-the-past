/* @layer store-site @kind logic */
import { Marked } from 'marked';
import { SAFE_HREF } from './render-markdown.constants';

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
