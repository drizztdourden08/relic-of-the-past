/* @layer renderer-widgets @kind hook */
/** State machine + codegen for the ConnectionEditorDialog wizard. */
import { useState, useMemo, useEffect } from 'react';
import type { ScreenConnection } from '@shared/game/types';
import type { ConnectionTag } from '@shared/game/data/connections/tags';
import type { ConnectionNavData } from '@shared/game/navigation';
import { serializeConnection, resolveConnectionFile } from '@shared/game/data/screen-codegen';
import { buildConnectionNav } from '@shared/game/navigation/analysis/connection-nav-from-flood';
import { useNavigationOverlayStore } from '../../../../stores/navigation-overlay-store';
import type { DetectedConnection } from './useDatasetStatus';
import { matchFlood, describeConnectionTiles } from './connection-tile-display';

interface EditableConnection {
  key: string;
  from: string;
  to: string;
  tags: ConnectionTag[];
  isNew: boolean;
  nav?: ConnectionNavData;
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

  // Live flood crossings for the current screen — supply persisted-nav fallbacks
  // and the tile data attached to newly written connections.
  const floodConnections = useNavigationOverlayStore(s => s.connections);

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
      nav: c.nav,
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

  // Generate code for new connections only. Attach nav derived from the
  // matching live flood crossing so the written connection carries tile data;
  // omit nav when no crossing backs the edge (never fabricate).
  const newConnections = connections.filter(c => c.isNew);
  const generatedCode = useMemo(
    () => newConnections.map(c => {
      const info = matchFlood(c, floodConnections, screenId);
      const nav = info ? buildConnectionNav(info, c.tags) : undefined;
      return serializeConnection({ from: c.from, to: c.to, tags: c.tags, nav });
    }).join('\n'),
    [newConnections, floodConnections, screenId],
  );

  // Read-only crossing description per connection (persisted nav, else flood).
  const tileDescriptions = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const c of connections) map[c.key] = describeConnectionTiles(c, floodConnections, screenId);
    return map;
  }, [connections, floodConnections, screenId]);

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
    suggestedConnections, newConnections, generatedCode, targetFile, tileDescriptions,
    addSuggested, addBlank, removeConnection, updateConnection, toggleTag, handleWrite,
  };
};

export { useConnectionEditor };
export type { EditableConnection };
