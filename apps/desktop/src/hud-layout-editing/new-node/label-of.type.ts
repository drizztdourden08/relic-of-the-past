/* @layer renderer-components @kind types */
import type { SpecOf } from '../element-spec.type';

type PlainSpec = SpecOf<'text' | 'repeat' | 'switch' | 'spacer' | 'shape'>;

export type { PlainSpec };
