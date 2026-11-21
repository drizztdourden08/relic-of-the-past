/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { StructureMode } from '@rotp/languages';

const STRUCTURE_WORDS: Record<StructureMode, Message> = {
  continuous: msg('language-editor:structure.continuous'),
  block: msg('language-editor:structure.block'),
  off: msg('language-editor:structure.off'),
};

const STRUCTURE_NOTES: Record<StructureMode, Message> = {
  continuous: msg('language-editor:structure.continuous.note'),
  block: msg('language-editor:structure.block.note'),
  off: msg('language-editor:structure.off.note'),
};

export { STRUCTURE_NOTES, STRUCTURE_WORDS };
