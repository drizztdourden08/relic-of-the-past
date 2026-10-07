/* @layer renderer-components @kind hook */
/**
 * Detects the assigned MSU pack's contents for the Audio settings tab's Auto mode.
 *
 * Reads the profile fresh from storage instead of trusting the profile object passed
 * down from the app shell, because that object is a snapshot from profile-load time and a pack
 * assigned in Data Manager afterwards never reaches it. AudioSettings remounts on every
 * tab activation, so a fresh read here is current whenever the tab is opened.
 */
import { useState, useEffect } from 'react';
import type { MsuPackProfile } from '@shared/features/msu-auto-config';
import { detectMsuPackProfile } from '@shared/features/msu-auto-config';
import * as msuStore from '@app/lib/storage/msu-store';
import * as profileStore from '@app/lib/storage/profile-store';

const useMsuPackProfile = (profileId: string) => {
  const [pack, setPack] = useState<MsuPackProfile | null>(null);
  const [packName, setPackName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      const profile = (await profileStore.listProfiles()).find((p) => p.id === profileId);
      const msuPack = profile?.msuPack;
      if (!msuPack) { if (!cancelled) { setPack(null); setPackName(null); } return; }
      // The manifest is what makes a pack layered, so it has to be read here too. Track names
      // alone cannot tell a layered pack from a classic one.
      const [tracks, manifest] = await Promise.all([
        msuStore.getMsuTrackList(msuPack),
        msuStore.readMsuManifest(msuPack),
      ]);
      if (!cancelled) {
        setPackName(msuPack);
        const known = tracks.length > 0 || manifest !== null;
        setPack(known ? detectMsuPackProfile(tracks, manifest !== null) : null);
      }
    };
    detect();
    return () => { cancelled = true; };
  }, [profileId]);

  return { pack, packName };
};

export { useMsuPackProfile };
