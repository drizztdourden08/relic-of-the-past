/* @layer renderer-components @kind logic */
import { marked } from 'marked';

const renderNotes = (md: string): string => {
  const html = marked.parse(md, { async: false }) as string;
  return html.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
};

export { renderNotes };
