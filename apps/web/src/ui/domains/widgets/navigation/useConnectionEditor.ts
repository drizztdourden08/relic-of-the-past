/* @layer renderer-widgets @kind hook */
/**
 * State machine + codegen for the ConnectionEditorDialog wizard.
 *
 * Endpoints are screen IDS throughout — a detected transition whose destination
 * has no record arrives with an empty `toScreenId`, which the user must fill from
 * the dataset before the write unlocks. Nothing here invents an endpoint, and
 * nothing hands source text to the write channel: the payload is the records.
 */
import { useState, useMemo, useEffect } from 'react';
import { connectionTagKeysOf } from '@shared/game/data';
import type { ConnectionRecord, ConnectionTag, ScreenId, ScreenRecord } from '@shared/game/data';
import { serializeConnectionRecord } from '@shared/game/data/record-codegen';
import { connectionRecordFile } from '@shared/game/data/record-file-targets';
import type { FileTarget } from '@shared/game/data/record-file-targets';
import type { PendingConnectionRecord } from '@shared/game/data/record-codegen';
import { buildConnectionNav } from '@shared/game/navigation/analysis/connection-nav-from-flood';
import { useNavigationOverlayStore } from '../../../../stores/navigation-overlay-store';
import type { DetectedConnection } from './useDatasetStatus';
import { buildConnectionRecord } from './build-connection-record';
import { inferTagsForDetected } from './connection-audit-resolve';
import { matchFlood, describeConnectionTiles } from './connection-tile-display';

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
  screenId: ScreenId | null;
  /** The dataset record for the current screen — the destination file comes from it. */
  screen: ScreenRecord | null;
  existingConnections: ConnectionRecord[];
  unmatchedConnections: DetectedConnection[];
}

const useConnectionEditor = (params: ConnectionEditorParams) => {
  const { open, onClose, screenId, existingConnections, unmatchedConnections } = params;

  const [step, setStep] = useState(0);
  const [connections, setConnections] = useState<EditableConnection[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  // Live flood crossings for the current screen — supply persisted-nav fallbacks
  // and the tile data attached to newly written connections.
  const floodConnections = useNavigationOverlayStore(s => s.connections);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setWriteError(null);
    setEditingIdx(null);
    setConnections(existingConnections.map(c => ({
      key: c.id,
      from: c.fromScreenId,
      to: c.toScreenId,
      tags: [...connectionTagKeysOf(c.tags)],
      isNew: false,
    })));
  }, [open, existingConnections]);

  // New connections to add, from the detected-but-unmapped transitions. The
  // destination is the id the detector resolved, or blank when the dataset has
  // no record for it — never a fabricated key.
  const suggestedConnections = useMemo((): EditableConnection[] => {
    if (!screenId) return [];
    return unmatchedConnections.map((det, i) => ({
      key: `suggested-${i}`,
      from: screenId,
      to: det.toScreenId ?? '',
      tags: inferTagsForDetected(det),
      isNew: true,
    }));
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

  const newConnections = connections.filter(c => c.isNew);

  // Records for the new edges. Nav comes from the matching live flood crossing so
  // the written connection carries tile data; omitted when no crossing backs it.
  // An edge whose endpoints do not both resolve yields no record and blocks the write.
  const pending = useMemo((): { records: PendingConnectionRecord[]; unresolved: string[] } => {
    const records: PendingConnectionRecord[] = [];
    const unresolved: string[] = [];
    for (const c of newConnections) {
      const info = matchFlood(c, floodConnections, screenId);
      const nav = info ? buildConnectionNav(info, c.tags) : undefined;
      const record = buildConnectionRecord({ fromScreenId: c.from, toScreenId: c.to, tags: c.tags, nav });
      if (record) records.push(record);
      else unresolved.push(`${c.from || '?'} → ${c.to || '?'}`);
    }
    return { records, unresolved };
  }, [newConnections, floodConnections, screenId]);

  const generatedCode = useMemo(
    () => pending.records.map(serializeConnectionRecord).join('\n'),
    [pending],
  );

  // Read-only crossing description per connection (persisted nav, else flood).
  const tileDescriptions = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const c of connections) map[c.key] = describeConnectionTiles(c, floodConnections, screenId);
    return map;
  }, [connections, floodConnections, screenId]);

  const targetFile = useMemo((): FileTarget | null => {
    const first = pending.records[0];
    if (!first) return null;
    return connectionRecordFile(first.fromScreenId, first.toScreenId);
  }, [pending]);

  const canWrite = pending.records.length > 0
    && pending.unresolved.length === 0
    && targetFile?.relativePath != null;

  const handleWrite = async () => {
    const filePath = targetFile?.relativePath;
    if (!filePath || !canWrite) return;
    setWriting(true);
    setWriteError(null);
    try {
      const result = await window.api.screenEditor.writeConnections({
        mode: 'insert', filePath, records: pending.records,
      });
      if (!result.success) setWriteError(result.error);
      else onClose();
    } catch (e: unknown) {
      setWriteError(e instanceof Error ? e.message : 'Write failed');
    } finally {
      setWriting(false);
    }
  };

  return {
    step, setStep, connections, editingIdx, setEditingIdx, writing, writeError,
    suggestedConnections, newConnections, generatedCode, targetFile, tileDescriptions,
    unresolved: pending.unresolved, canWrite,
    addSuggested, addBlank, removeConnection, updateConnection, toggleTag, handleWrite,
  };
};

export { useConnectionEditor };
export type { ConnectionEditorParams, EditableConnection };
