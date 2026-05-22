import { useEffect, useCallback, useState } from 'react';
import { useEditorState } from './hooks/useEditorState';
import { useEditorShortcuts } from './hooks/useEditorShortcuts';
import { ShadowEditorToolbar } from './ShadowEditorToolbar';
import { ShadowEditorSidebar } from './ShadowEditorSidebar';
import { ShadowEditorCanvas } from './ShadowEditorCanvas';
import type { ShadowCastingProject } from '@shared/types/shadow-casting';
import './ShadowEditor.css';

interface ShadowEditorProps {
  width: number;
  height: number;
  onClose: () => void;
}

const ShadowEditor = (props: ShadowEditorProps) => {
  const { width, height, onClose } = props;
  const { loadProject, project, dirty, markClean, currentScreenId } = useEditorState();
  const [loading, setLoading] = useState(true);

  useEditorShortcuts();

  // Load project on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await window.api.shadowCasting.load() as ShadowCastingProject;
        loadProject(data);
      } catch (err) {
        console.error('[ShadowEditor] Failed to load project:', err);
      }
      setLoading(false);
    };
    load();
  }, [loadProject]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!dirty) return;
    try {
      await window.api.shadowCasting.save(project);
      markClean();
    } catch (err) {
      console.error('[ShadowEditor] Failed to save:', err);
    }
  }, [project, dirty, markClean]);

  // Listen for save events (from keyboard shortcut)
  useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener('shadow-editor:save', handler);
    return () => window.removeEventListener('shadow-editor:save', handler);
  }, [handleSave]);

  // Warn before closing with unsaved changes
  const handleClose = useCallback(() => {
    if (dirty) {
      if (!confirm('You have unsaved changes. Close anyway?')) return;
    }
    onClose();
  }, [dirty, onClose]);

  if (loading) {
    return (
      <div className="shadow-editor">
        <div className="shadow-editor__loading">Loading shadow data...</div>
      </div>
    );
  }

  return (
    <div className="shadow-editor">
      <div className="shadow-editor__header">
        <ShadowEditorToolbar />
        <div className="shadow-editor__header-info">
          <span className="shadow-editor__screen-label">Screen: {currentScreenId}</span>
          <button className="shadow-editor__close-btn" onClick={handleClose} title="Close Editor">
            ✕
          </button>
        </div>
      </div>
      <div className="shadow-editor__body">
        <div className="shadow-editor__canvas-area">
          <ShadowEditorCanvas width={width} height={height} />
        </div>
        <ShadowEditorSidebar />
      </div>
    </div>
  );
};

export { ShadowEditor };
