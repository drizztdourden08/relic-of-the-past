/* @layer renderer-components @kind component */
import type { InstalledPack } from '@rotp/hub-contracts';
import { InstalledOriginBar } from './InstalledOriginBar';

const installedOriginOf = (pack: InstalledPack | null, onChanged: (name: string) => void, onUninstalled: () => void) =>
  (pack === null ? null : <InstalledOriginBar pack={pack} onDuplicated={onChanged} onUpdateInstalled={onChanged} onUninstalled={onUninstalled} />);

export { installedOriginOf };
