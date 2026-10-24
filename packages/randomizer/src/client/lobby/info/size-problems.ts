/* @layer bridge-wasm @kind logic */
import type { Failure, Limits } from '@drizztdourden08/archipelia-lobby-protocol';
import type { InfoCheckInput } from './lobby-info-problems.type';
import { MIB } from './size-problems.constants';

const mib = (bytes: number): string => `${(bytes / MIB).toFixed(1)} MiB`;

const tooLarge = (what: string, bytes: number, limit: number): Failure => ({
  code: 'upload-too-large',
  message: `The ${what} is ${mib(bytes)}. This lobby takes ${mib(limit)}.`,
});

const sizeProblems = (limits: Limits, input: InfoCheckInput): Failure[] => {
  const found: Failure[] = [];
  if (input.worldBytes > limits.maxWorldBytes) found.push(tooLarge('world', input.worldBytes, limits.maxWorldBytes));
  const yaml = Math.max(0, ...input.yamlBytes);
  if (yaml > limits.maxYamlBytes) found.push(tooLarge('YAML', yaml, limits.maxYamlBytes));
  const total = input.worldBytes + input.yamlBytes.reduce((sum, size) => sum + size, 0);
  if (total > limits.maxMemberBytes) found.push(tooLarge('upload', total, limits.maxMemberBytes));
  return found;
};

export { sizeProblems };
