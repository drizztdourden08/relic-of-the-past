/* @layer renderer-lib @kind logic */
import type { FunctionMapping } from '@rotp/features';
import type { ButtonIcon } from '@rotp/game-data';
import { resolveIconByVidPid } from './resolve-icon-by-vid-pid';

const resolveFunctionMappingIcon = (m: FunctionMapping, liveSdlType?: string | null): ButtonIcon | null => {
  if (m.icon) return m.icon;
  if (m.binding.type === 'none' || m.binding.type === 'keyboard') return null;
  const vid = m.sourceVid?.toLowerCase().padStart(4, '0');
  const pid = m.sourcePid?.toLowerCase().padStart(4, '0');
  if (!vid || !pid) return null;
  return resolveIconByVidPid(vid, pid, m.binding, liveSdlType);
};

export { resolveFunctionMappingIcon };
