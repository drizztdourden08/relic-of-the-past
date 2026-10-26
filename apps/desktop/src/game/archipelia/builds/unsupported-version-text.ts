/* @layer bridge-wasm @kind logic */
import type { WorldPackageBuild } from '@app/archipelago/world-package';

const partsOf = (version: string): number[] => version.split('.').map((part) => Number.parseInt(part, 10) || 0);

const compareVersions = (left: string, right: string): number => {
  const a = partsOf(left);
  const b = partsOf(right);
  for (let at = 0; at < Math.max(a.length, b.length); at += 1) {
    const step = (a[at] ?? 0) - (b[at] ?? 0);
    if (step !== 0) return step;
  }
  return 0;
};

const listOf = (items: readonly string[]): string => {
  if (items.length <= 1) return items[0] ?? 'no version';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1] ?? ''}`;
};

const unsupportedVersionText = (ap: string, builds: readonly WorldPackageBuild[]): string => {
  const versions = builds.map((build) => build.archipelagoVersion).sort(compareVersions);
  return `This lobby runs Archipelago ${ap}. RotP supports ${listOf(versions)}.`;
};

export { unsupportedVersionText };
