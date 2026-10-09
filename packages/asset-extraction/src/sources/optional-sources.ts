/* @layer shared-asset-extraction @kind data */
import { compileGbaAlttpSource } from './compile-gba-alttp-source';
import type { OptionalSource } from './source.type';

const OPTIONAL_SOURCES: OptionalSource[] = [
  {
    id: 'gba-alttp',
    compile: compileGbaAlttpSource,
  },
];

export { OPTIONAL_SOURCES };
