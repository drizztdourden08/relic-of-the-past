/* @layer renderer-components @kind types */
import type { HudShadow } from '@rotp/hud';

interface ShadowListEditorProps {
  value: HudShadow[] | undefined;
  onChange: (next: HudShadow[] | undefined) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  openKey: string | null;
  onToggleKey: (key: string) => void;
}

export type { ShadowListEditorProps };
