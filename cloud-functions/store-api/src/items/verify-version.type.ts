/* @layer store-api @kind types */
import type { KindFacts } from '../../../../shared/store/types';

type VerifiedVersion = { facts: KindFacts; sha256: string; bytes: number };

export type { VerifiedVersion };
