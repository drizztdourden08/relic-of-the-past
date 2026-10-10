/* @layer tests @kind helper */
import { TEST_INSTANCE } from './ensure-test-profile.constants';
import { restoreFixtureSaves } from './restore-fixture-saves';

let provisioned: Promise<unknown> | null = null;

const ensureTestProfile = (): Promise<unknown> => {
  provisioned ??= (async () => {
    const { provisionProfile } = await import('../../../../../scripts/parallel/provision-profile.mjs');
    const result = await provisionProfile({ name: TEST_INSTANCE });
    await restoreFixtureSaves();
    return result;
  })();
  return provisioned;
};

export { ensureTestProfile };
