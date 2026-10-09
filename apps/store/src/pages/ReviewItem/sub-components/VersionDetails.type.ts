/* @layer store-site @kind types */
import type { StoreVersion } from '@rotp/hub-contracts';

type VersionDetailsProps = { version: StoreVersion };

type FactRow = { label: string; value: string };

export type { VersionDetailsProps, FactRow };
