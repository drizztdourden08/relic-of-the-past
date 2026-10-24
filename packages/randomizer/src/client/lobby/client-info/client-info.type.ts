/* @layer bridge-wasm @kind types */
import type { PlatformArch, PlatformOs } from '@drizztdourden08/archipelia-lobby-protocol';

type LobbyPlatform = { os: PlatformOs; arch: PlatformArch };

type ClientInfoInput = { version: string; build?: string; platform: LobbyPlatform };

export type { ClientInfoInput, LobbyPlatform };
