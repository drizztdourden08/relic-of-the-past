/* @layer store-api @kind types */
import type { ReviewState } from '../../../../shared/store/review-types';
import type { StoreVersion } from '../../../../shared/store/types';
import type { Actor, VersionAction } from '../../../../shared/store/version-flow';

type Reshape = (version: StoreVersion, to: ReviewState) => StoreVersion;

type Move = { n: number; action: VersionAction; actors: readonly Actor[]; reshape: Reshape };

export type { Move, Reshape };
