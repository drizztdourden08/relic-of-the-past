/* @layer renderer-components @kind types */
import type { FieldDescriptor, SchemaConfig } from '../../data/schema/field-descriptor';
import type { IdRefOptionResolver } from '../field-kits/registry';
import type { NumberBoundsResolver, TagCreator, TagSuggestionResolver } from '../RecordEditor';

type CreateOutcome =
  | { success: true; id: string }
  | { success: false; error: string };

interface CreateRecordDialogProps {
  open: boolean;
  title: string;
  /** Already trimmed to what this collection's create channel can carry. See `create-schema.ts`. */
  schema: readonly FieldDescriptor[];
  config?: SchemaConfig;
  /** A blank starting record: every optional field left absent, every required one seeded. */
  initialRecord: Record<string, unknown>;
  /** Paths that must hold a value before the record can be created. */
  requiredPaths: readonly string[];
  resolveIdRefOptions?: IdRefOptionResolver;
  resolveTagSuggestions?: TagSuggestionResolver;
  onCreateTag?: TagCreator;
  resolveNumberBounds?: NumberBoundsResolver;
  /** Sends the filled-in draft to wherever this kind's records are written. */
  onCreate: (record: Record<string, unknown>) => Promise<CreateOutcome>;
  /** The record was created. Carries its freshly allocated id. */
  onCreated: (id: string) => void;
  onCancel: () => void;
}

export type { CreateOutcome, CreateRecordDialogProps };
