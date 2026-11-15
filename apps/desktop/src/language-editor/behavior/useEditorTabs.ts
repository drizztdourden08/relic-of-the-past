/* @layer renderer-components @kind hook */
import { createElement, useMemo } from 'react';
import { glyphPlaceholder } from '@rotp/asset-extraction';
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { LOCKED_ICON } from '../LanguageEditor.constants';
import type { EditorTabsParams } from './editor-tabs.type';

const useEditorTabs = (params: EditorTabsParams): TabItem[] => {
  const { dialogueCount, variableCount, groups, glyphs } = params;
  const textSlotCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.slots.length, 0),
    [groups],
  );
  const letterCount = useMemo(
    () => Object.entries(glyphs ?? {}).filter(([token, glyph]) => token === glyphPlaceholder(glyph)).length,
    [glyphs],
  );

  return useMemo<TabItem[]>(() => [
    { id: 'dialogue', label: 'Dialogue', badge: dialogueCount },
    { id: 'variables', label: 'Variables', icon: createElement(Icon, { name: LOCKED_ICON }), badge: variableCount },
    { id: 'text', label: 'Text', icon: createElement(Icon, { name: LOCKED_ICON }), badge: textSlotCount },
    ...(letterCount > 0 ? [{ id: 'letters', label: 'Name the letters', badge: letterCount }] : []),
  ], [dialogueCount, variableCount, textSlotCount, letterCount]);
};

export { useEditorTabs };
