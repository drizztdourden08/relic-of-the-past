/* @layer renderer-app @kind logic */
import type { ReactNode } from 'react';
import { PlayerSpriteSelector } from '../PlayerSpriteSelector';
import type { ControlContext } from '../settings-controls.type';

const renderGraphicsControl = (key: string, ctx: ControlContext): ReactNode | null => {
  const { settings, onChange } = ctx;
  if (key !== 'linkSprite') return null;
  return <PlayerSpriteSelector value={settings.linkSprite} onChange={(linkSprite) => onChange({ linkSprite })} />;
};

export { renderGraphicsControl };
