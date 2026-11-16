/* @layer renderer-components @kind hook */
import { createElement, useMemo } from 'react';
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { LOCKED_ICON } from '../LanguageEditor.constants';
import type { EditorTabsParams } from './editor-tabs.type';

const useEditorTabs = (params: EditorTabsParams): TabItem[] => {
  const { dialogueCount, variableCount, groups } = params;
  const textSlotCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.slots.length, 0),
    [groups],
  );

  return useMemo<TabItem[]>(() => [
    { id: 'dialogue', label: 'Dialogue', badge: dialogueCount },
    { id: 'variables', label: 'Variables', icon: createElement(Icon, { name: LOCKED_ICON }), badge: variableCount },
    { id: 'text', label: 'Text', icon: createElement(Icon, { name: LOCKED_ICON }), badge: textSlotCount },
  ], [dialogueCount, variableCount, textSlotCount]);
};

export { useEditorTabs };
