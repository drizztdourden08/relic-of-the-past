/* @layer store-api @kind types */
import type { KindFacts } from '@rotp/hub-contracts';

type VerifiedVersion = { facts: KindFacts; sha256: string; bytes: number };

export type { VerifiedVersion };
