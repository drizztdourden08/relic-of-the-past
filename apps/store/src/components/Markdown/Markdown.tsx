/* @layer store-site @kind component */
/** Markdown written on the site (the welcome, a description), rendered safe and set at reading width. */
import { useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { renderMarkdown } from '../../lib/render-markdown';
import './Markdown.css';

type MarkdownProps = {
  source: string;
  className?: string;
};

const Markdown = (props: MarkdownProps) => {
  const { source, className = '' } = props;
  const html = useMemo(() => renderMarkdown(source), [source]);
  return <Box className={`markdown${className ? ` ${className}` : ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
};

export { Markdown };
export type { MarkdownProps };
