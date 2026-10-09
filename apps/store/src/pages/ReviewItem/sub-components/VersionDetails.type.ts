/* @layer store-site @kind types */
import type { StoreVersion } from '@shared/store/types';

type VersionDetailsProps = { version: StoreVersion };

type FactRow = { label: string; value: string };

export type { VersionDetailsProps, FactRow };
