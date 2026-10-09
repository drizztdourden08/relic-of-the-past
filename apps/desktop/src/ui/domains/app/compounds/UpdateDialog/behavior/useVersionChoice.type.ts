/* @layer renderer-components @kind types */
import type { UpdateState } from '@app/hooks/useAutoUpdate';

type UpdateAction = 'update' | 'reinstall' | 'downgrade';

interface Params {
  open: boolean;
  state: UpdateState;
  loadVersions: () => Promise<void>;
}

interface VersionFacts {
  downloadSize: number;
  releaseDate: string;
  downgrade: boolean;
  installed: boolean;
  prerelease: boolean;
}

export type { Params, UpdateAction, VersionFacts };
