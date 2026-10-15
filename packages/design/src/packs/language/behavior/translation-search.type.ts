/* @layer renderer-components @kind types */
type NameGroup = 'items' | 'bottles' | 'labels';

type SearchHitKind = 'dialogue' | 'glossary' | 'name';

type SearchField = 'text' | 'note' | 'chip' | 'key' | 'value';

type SearchHit = {
  kind: SearchHitKind;
  id: string;
  field: SearchField;
  entryId: number | null;
  group: NameGroup | null;
  preview: string;
};

type TranslationSearchState = {
  hits: SearchHit[];
  count: number;
  applied: string;
  pending: boolean;
};

export type { SearchHit, TranslationSearchState };
