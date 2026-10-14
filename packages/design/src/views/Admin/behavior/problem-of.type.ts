/* @layer site-kit @kind types */
import type { createGroupSchema } from '@rotp/hub-contracts';

type ParsedGroup = ReturnType<typeof createGroupSchema.safeParse>;

export type { ParsedGroup };
