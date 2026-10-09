/* @layer renderer-components @kind hook */
import { useState, useEffect } from 'react';
import type { MsuPackProfile } from '@rotp/features';
import { detectMsuPackProfile } from '@rotp/features';
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
    void detect();
    return () => { cancelled = true; };
  }, [profileId]);

  return { pack, packName };
};

export { useMsuPackProfile };
