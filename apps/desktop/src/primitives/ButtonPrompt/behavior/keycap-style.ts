/* @layer renderer-hud @kind logic */
import type { CSSProperties } from 'react';
import { promptTextStyle } from './prompt-text-style';

const keycapStyle = (height: number, ink: string, stroke: string): CSSProperties => ({
  ...promptTextStyle(Math.round(height * 0.8), ink, stroke),
  minWidth: height,
  height,
  padding: `0 ${Math.round(height / 5)}px`,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `${Math.max(1, Math.round(height / 10))}px solid ${ink}`,
  borderRadius: Math.round(height / 5),
});

export { keycapStyle };
