import { useEffect } from 'react';
import { useEditorState } from './useEditorState';

function useEditorShortcuts(): void {
  const { undo, redo, activeTool, setActiveTool, selectedElementId, selectedType, removeHeightmapElement, removeLight } = useEditorState();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture shortcuts when typing in inputs
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;

      // Undo: Ctrl+Z
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        if (selectedType === 'heightmap') removeHeightmapElement(selectedElementId);
        else if (selectedType === 'light') removeLight(selectedElementId);
        return;
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.altKey) {
        switch (e.key) {
          case 'v': case 'V': setActiveTool('select'); break;
          case 'p': case 'P': setActiveTool('polygon'); break;
          case 'f': case 'F': setActiveTool('freehand'); break;
          case 'l': case 'L': setActiveTool('point-light'); break;
          case 's': case 'S': setActiveTool('shape-light'); break;
        }
      }

      // Save: Ctrl+S
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        // Save handled externally by the editor component
        window.dispatchEvent(new CustomEvent('shadow-editor:save'));
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, activeTool, setActiveTool, selectedElementId, selectedType, removeHeightmapElement, removeLight]);
}

export { useEditorShortcuts };
