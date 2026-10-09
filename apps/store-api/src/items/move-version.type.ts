/* @layer store-api @kind types */
import type { ReviewState, StoreVersion, Actor, VersionAction } from '@rotp/hub-contracts';

type Reshape = (version: StoreVersion, to: ReviewState) => StoreVersion;

type Move = { n: number; action: VersionAction; actors: readonly Actor[]; reshape: Reshape };

export type { Move, Reshape };
