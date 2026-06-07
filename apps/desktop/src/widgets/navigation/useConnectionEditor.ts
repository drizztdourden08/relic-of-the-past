/* @layer renderer-widgets @kind hook */
/** State machine + codegen for the ConnectionEditorDialog wizard. */
import { useState, useMemo, useEffect } from 'react';
import type { ScreenConnection } from '@shared/game/types';
import type { ConnectionTag } from '@shared/game/data/connections/tags';
import { serializeConnection, resolveConnectionFile } from '@shared/game/data/screen-codegen';
import type { DetectedConnection } from './useDatasetStatus';

interface EditableConnection {
  key: string;
  from: string;
  to: string;
  tags: ConnectionTag[];
  isNew: boolean;
}

interface ConnectionEditorParams {
  open: boolean;
  onClose: () => void;
  screenId: string | null;
  screenMeta: { type: string; dungeon?: string; isDarkWorld: boolean } | null;
  existingConnections: ScreenConnection[];
  unmatchedConnections: DetectedConnection[];
}

const useConnectionEditor = (params: ConnectionEditorParams) => {
  const { open, onClose, screenId, screenMeta, existingConnections, unmatchedConnections } = params;

  const [step, setStep] = useState(0);
  const [connections, setConnections] = useState<EditableConnection[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  // Initialize on open
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setWriteError(null);
    setEditingIdx(null);

    const existing: EditableConnection[] = existingConnections.map((c, i) => ({
      key: `existing-${i}`,
      from: c.from,
      to: c.to,
      tags: [...c.tags],
      isNew: false,
    }));

    setConnections(existing);
  }, [open, existingConnections]);

  // New connections to add (from detected unmatched)
  const suggestedConnections = useMemo((): EditableConnection[] => {
    if (!screenId) return [];
    return unmatchedConnections.map((det, i) => {
      const tags: ConnectionTag[] = [];
      // Infer tags from detection type
      if (det.type === 'entrance') {
        tags.push('transit:door', 'dir:two-way', 'ctx:entrance');
      } else if (det.type === 'stair') {
        tags.push('transit:stairs', 'dir:two-way', 'ctx:internal');
      } else {
        tags.push('transit:walk', 'dir:two-way', 'ctx:internal');
      }

      // Build a suggested screen ID for the target
      const targetHex = det.targetRoomOrScreen.toString(16).padStart(2, '0');
      const suggestedTo = det.type === 'entrance'
        ? `lw-${targetHex}` // overworld screen
        : `room-0x${targetHex}`; // indoor room

      return {
        key: `suggested-${i}`,
        from: screenId,
        to: suggestedTo,
        tags,
        isNew: true,
      };
    });
  }, [screenId, unmatchedConnections]);

  const addSuggested = (suggested: EditableConnection) => {
    setConnections(prev => [...prev, { ...suggested, key: `added-${Date.now()}-${Math.random()}` }]);
  };

  const addBlank = () => {
    setConnections(prev => [...prev, {
      key: `new-${Date.now()}`,
      from: screenId ?? '',
      to: '',
      tags: ['transit:door', 'dir:two-way'],
      isNew: true,
    }]);
    setEditingIdx(connections.length);
  };

  const removeConnection = (idx: number) => {
    setConnections(prev => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const updateConnection = (idx: number, patch: Partial<EditableConnection>) => {
    setConnections(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const toggleTag = (idx: number, tag: ConnectionTag) => {
    const conn = connections[idx];
    const tags = conn.tags.includes(tag)
      ? conn.tags.filter(t => t !== tag)
      : [...conn.tags, tag];
    updateConnection(idx, { tags });
  };

  // Generate code for new connections only
  const newConnections = connections.filter(c => c.isNew);
  const generatedCode = useMemo(
    () => newConnections.map(c => serializeConnection(c)).join('\n'),
    [newConnections],
  );

  const targetFile = useMemo(() => {
    if (!screenMeta || newConnections.length === 0) return null;
    return resolveConnectionFile(
      newConnections[0],
      screenMeta.type,
      screenMeta.dungeon,
      screenMeta.isDarkWorld ? 'dark' : 'light',
    );
  }, [newConnections, screenMeta]);

  const handleWrite = async () => {
    if (!targetFile || !generatedCode) return;
    setWriting(true);
    setWriteError(null);
    try {
      const result = await window.api.screenEditor.writeConnections({
        filePath: targetFile.relativePath,
        code: generatedCode,
      });
      if (!result.success) {
        setWriteError(result.error ?? 'Unknown error');
      } else {
        onClose();
      }
    } catch (e: unknown) {
      setWriteError(e instanceof Error ? e.message : 'Write failed');
    } finally {
      setWriting(false);
    }
  };

  return {
    step, setStep, connections, editingIdx, setEditingIdx, writing, writeError,
    suggestedConnections, newConnections, generatedCode, targetFile,
    addSuggested, addBlank, removeConnection, updateConnection, toggleTag, handleWrite,
  };
};

export { useConnectionEditor };
export type { EditableConnection };
