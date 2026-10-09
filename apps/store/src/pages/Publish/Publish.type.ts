/* @layer store-site @kind types */
type PublishMode = 'new' | 'version' | 'listing';

type PublishProps = {
  mode: PublishMode;
  itemId?: string;
};

type FieldKey = 'pack' | 'name' | 'summary' | 'description' | 'tags' | 'license' | 'card' | 'rights';

type FieldErrors = Partial<Record<FieldKey, string>>;

export type { PublishMode, PublishProps, FieldKey, FieldErrors };
