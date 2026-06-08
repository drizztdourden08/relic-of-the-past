/* @layer renderer-components @kind hook */
/** Auto-detects the connected HID device (SDL DB + profile match) and exposes SDL selection. */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { webHidReader } from '../../../../../../../../lib/input/hid-reader';
import { findDeviceProfileByVidPid } from '@shared/input';
import { DEVICE_DATABASE } from '@shared/input/data/devices';
import type { SelectOption } from '../../../../../../../design-system/primitives';

const useDeviceAutoDetect = (addLog: (msg: string) => void) => {
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedSdlVidPid, setSelectedSdlVidPid] = useState('');
  const [hasGyro, setHasGyro] = useState(true);

  // ── Auto-detect ──
  useEffect(() => {
    const keys = webHidReader.getConnectedDeviceKeys(); if (keys.length === 0) return;
    const [vid, pid] = keys[0].split(':'); const vidPid = `${vid}:${pid}`;
    const sdlMatch = DEVICE_DATABASE.find(e => e.vidPid === vidPid);
    if (sdlMatch) { setSelectedSdlVidPid(vidPid); setHasGyro(sdlMatch.hasGyro); addLog(`SDL match: ${sdlMatch.name} (${vidPid})${sdlMatch.hasGyro ? ' [gyro]' : ''}`); }
    else { addLog(`No SDL match for ${vidPid} — pick manually or use Generic`); }
    const profileMatch = findDeviceProfileByVidPid(vid, pid);
    if (profileMatch) { setSelectedProfileId(profileMatch.id); addLog(`Auto-detected profile: ${profileMatch.name} (${vid}:${pid})`); }
    else { addLog(`No profile for ${vid}:${pid} — select from SDL list or use Generic`); }
  }, [addLog]);

  // ── SDL options ──
  const sdlOptions: SelectOption[] = useMemo(() => DEVICE_DATABASE.filter(e => e.vidPid).map(e => ({ value: e.vidPid!, label: `${e.name} (${e.vidPid})${e.hasGyro ? ' 🔄' : ''}` })), []);
  const handleSdlSelect = useCallback((vidPid: string) => {
    setSelectedSdlVidPid(vidPid); const entry = DEVICE_DATABASE.find(e => e.vidPid === vidPid); if (entry) setHasGyro(entry.hasGyro);
    if (vidPid) { const [vid, pid] = vidPid.split(':'); const m = findDeviceProfileByVidPid(vid, pid); if (m) setSelectedProfileId(m.id); }
  }, []);

  return { selectedProfileId, selectedSdlVidPid, hasGyro, sdlOptions, handleSdlSelect };
};

export { useDeviceAutoDetect };
