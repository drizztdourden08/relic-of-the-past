/* @layer shared-game @kind logic */
/**
 * A small block-style YAML emitter: scalars, nested objects and arrays, two spaces per level.
 * Enough for an Archipelago player file, with no dependency.
 *
 * The word `random` is never written bare. Archipelago reads it, as an option value, as its
 * own keyword for "roll one"; an option is resolved to a fixed spelling before it gets here
 * (concrete-option-values.ts), and any nested `random` (the pre-rolled readings) is quoted.
 */
import { emitLines } from './emit-lines';
import type { YamlValue } from './yaml-emit.type';

/** The whole document, ending in a newline. A top-level scalar is written on its own. */
const emitYaml = (value: YamlValue): string => `${emitLines(value, 0).join('\n')}\n`;

export { emitYaml };
