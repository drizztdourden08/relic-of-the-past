/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { PatchedPartId } from '@rotp/asset-extraction';

const PART_LABELS: Readonly<Record<PatchedPartId, Message>> = {
  dialogue: msg('compounds:patched-import-report.part.dialogue'),
  'font-tiles': msg('compounds:patched-import-report.part.font-tiles'),
  letters: msg('compounds:patched-import-report.part.letters'),
  dictionary: msg('compounds:patched-import-report.part.dictionary'),
  'menu-text': msg('compounds:patched-import-report.part.menu-text'),
  credits: msg('compounds:patched-import-report.part.credits'),
  screens: msg('compounds:patched-import-report.part.screens'),
};

export { PART_LABELS };
