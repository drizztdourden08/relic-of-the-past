/* @layer store-site @kind types */
/** The Publish form's fields that can be wrong, and the message for each one that is. */

type FieldKey = 'pack' | 'name' | 'summary' | 'description' | 'tags' | 'license' | 'card' | 'rights';

/** Only the fields that are wrong have an entry. */
type FieldErrors = Partial<Record<FieldKey, string>>;

export type { FieldKey, FieldErrors };
