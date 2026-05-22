import { useEditorState, type EditorTool } from './hooks/useEditorState';

interface ToolButtonProps {
  tool: EditorTool;
  icon: string;
  label: string;
  shortcut: string;
}

const TOOLS: ToolButtonProps[] = [
  { tool: 'select', icon: '⊹', label: 'Select / Move', shortcut: 'V' },
  { tool: 'polygon', icon: '⬡', label: 'Polygon Shape', shortcut: 'P' },
  { tool: 'freehand', icon: '✎', label: 'Freehand Polygon', shortcut: 'F' },
  { tool: 'point-light', icon: '💡', label: 'Point Light', shortcut: 'L' },
  { tool: 'shape-light', icon: '🔦', label: 'Shape Light', shortcut: 'S' },
];

const ShadowEditorToolbar = () => {
  const { activeTool, setActiveTool, undo, redo, undoStack, redoStack, dirty } = useEditorState();

  const handleSave = () => {
    window.dispatchEvent(new CustomEvent('shadow-editor:save'));
  };

  return (
    <div className="shadow-editor__toolbar">
      <div className="shadow-editor__toolbar-group">
        {TOOLS.map((t) => (
          <button
            key={t.tool}
            className={`shadow-editor__tool-btn${activeTool === t.tool ? ' shadow-editor__tool-btn--active' : ''}`}
            onClick={() => setActiveTool(t.tool)}
            title={`${t.label} (${t.shortcut})`}
          >
            <span className="shadow-editor__tool-icon">{t.icon}</span>
          </button>
        ))}
      </div>

      <div className="shadow-editor__toolbar-group">
        <button
          className="shadow-editor__tool-btn"
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          className="shadow-editor__tool-btn"
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo (Ctrl+Shift+Z)"
        >
          ↷
        </button>
      </div>

      <div className="shadow-editor__toolbar-group">
        <button
          className="shadow-editor__tool-btn shadow-editor__tool-btn--save"
          onClick={handleSave}
          disabled={!dirty}
          title="Save (Ctrl+S)"
        >
          💾 {dirty ? '*' : ''}
        </button>
      </div>
    </div>
  );
};

export { ShadowEditorToolbar };
