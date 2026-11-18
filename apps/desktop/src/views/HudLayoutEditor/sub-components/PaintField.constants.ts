/* @layer renderer-components @kind constants */
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { PaintMode } from './PaintField.type';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';

const KINDS: readonly { value: PaintMode; icon: IconName; label: Message }[] = [
  { value: 'color', icon: 'palette', label: msg('hud-editor:paint.kind.color') },
  { value: 'gradient', icon: 'layers', label: msg('hud-editor:paint.kind.gradient') },
  { value: 'image', icon: 'image', label: msg('hud-editor:paint.kind.image') },
];

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

export { HEX_RE, KINDS };
