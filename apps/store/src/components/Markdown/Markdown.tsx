/* @layer store-site @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { renderMarkdown } from '../../lib/render-markdown';
import type { MarkdownProps } from './Markdown.type';
import './Markdown.css';

const Markdown = (props: MarkdownProps) => {
  const { source, className = '' } = props;
  const html = useMemo(() => renderMarkdown(source), [source]);
  return <Box className={`markdown${className ? ` ${className}` : ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
};

export { Markdown };
export type { MarkdownProps } from './Markdown.type';
