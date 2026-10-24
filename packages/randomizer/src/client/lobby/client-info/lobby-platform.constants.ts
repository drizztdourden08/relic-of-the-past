/* @layer bridge-wasm @kind constants */
import type { PlatformArch, PlatformOs } from '@archipelia/lobby-protocol';

const OS_OF_NODE: Record<string, PlatformOs> = {
  win32: 'windows',
  darwin: 'macos',
  linux: 'linux',
  android: 'android',
};

const ARCH_OF_NODE: Record<string, PlatformArch> = { x64: 'x64', arm64: 'arm64' };

export { ARCH_OF_NODE, OS_OF_NODE };
