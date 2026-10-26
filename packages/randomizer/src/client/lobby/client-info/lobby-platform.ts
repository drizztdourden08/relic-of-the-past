/* @layer bridge-wasm @kind logic */
import type { LobbyPlatform } from './client-info.type';
import { ARCH_OF_NODE, OS_OF_NODE } from './lobby-platform.constants';

const lobbyPlatformOf = (nodePlatform: string, nodeArch: string): LobbyPlatform => ({
  os: OS_OF_NODE[nodePlatform] ?? 'other',
  arch: ARCH_OF_NODE[nodeArch] ?? 'other',
});

export { lobbyPlatformOf };
