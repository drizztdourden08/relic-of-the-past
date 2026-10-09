/* @layer store-site @kind types */
import type { FieldKey } from '../Publish.type';

type MaybeErrors = Partial<Record<FieldKey, string | null | undefined>>;

export type { MaybeErrors };
