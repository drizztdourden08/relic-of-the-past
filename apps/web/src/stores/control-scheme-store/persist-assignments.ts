/* @layer renderer-stores @kind logic */
import { getProfileId } from '@app/lib/game/wasm-bridge';
import { readConfig, writeConfig } from '@app/lib/storage/profile-store';
import type { Assignments } from './control-scheme-store.type';

let writeQueue: Promise<void> = Promise.resolve();

const persistAssignments = (assignments: Assignments): void => {
  const id = getProfileId();
  if (!id) return;
  writeQueue = writeQueue
    .then(async () => {
      const config = (await readConfig(id)) ?? {};
      await writeConfig(id, { ...config, modernScheme: { assignments } });
    })
    .catch((e: unknown) => console.error('[controls] failed to persist slot assignments', e));
};

export { persistAssignments };
