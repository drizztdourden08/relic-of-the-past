/* @layer renderer-components @kind hook */
import { createElement, useMemo } from 'react';
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { LOCKED_ICON } from '../LanguageEditor.constants';
import type { EditorTabsParams } from './editor-tabs.type';

const useEditorTabs = (params: EditorTabsParams): TabItem[] => {
  const { dialogueCount, variableCount, groups } = params;
  const t = useT();
  const textSlotCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.slots.length, 0),
    [groups],
  );

  return useMemo<TabItem[]>(() => [
    { id: 'dialogue', label: t('language-editor:tabs.dialogue'), badge: dialogueCount },
    { id: 'variables', label: t('language-editor:tabs.variables'), icon: createElement(Icon, { name: LOCKED_ICON }), badge: variableCount },
    { id: 'text', label: t('language-editor:tabs.text'), icon: createElement(Icon, { name: LOCKED_ICON }), badge: textSlotCount },
  ], [t, dialogueCount, variableCount, textSlotCount]);
};

export { useEditorTabs };
