/* @layer renderer-app @kind types */
import type { ComponentType } from 'react';

interface TokenSpec {
  name: string;
  cssVar: string;
  value: string;
  note?: string;
}

interface TokenGroup {
  title: string;
  description?: string;
  tokens: TokenSpec[];
}

interface StoryMeta {
  id: string;
  label: string;
  group: string;
  Component: ComponentType;
}

export type { StoryMeta, TokenGroup, TokenSpec };
