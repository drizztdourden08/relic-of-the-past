/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { readInputProfiles } from '@app/storage/profile-data-store';
import { activeProfileId } from '@app/hud/active-profile';
import { patchSchemeProfiles } from './patch-scheme-profiles';
import { pickActiveScheme } from './pick-active-scheme';
import { schemesOfProfile } from './schemes-of-profile';
import type { EditorScheme, EditorSchemes } from './editor-schemes.type';

const useEditorSchemes = (): EditorSchemes => {
  const [schemes, setSchemes] = useState<readonly EditorScheme[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    const isStale = (): boolean => abort.signal.aborted;
    void (async () => {
      const profileId = await activeProfileId();
      if (!profileId || isStale()) return;
      const loaded = await readInputProfiles(profileId);
      const list = loaded.flatMap(schemesOfProfile);
      if (isStale()) return;
      setSchemes(list);
      setSelectedId(await pickActiveScheme(profileId, list));
    })();
    return () => { abort.abort(); };
  }, []);

  const assignLayout = useCallback(async (schemeId: string, nextLayoutId: string) => {
    await patchSchemeProfiles(schemeId, (modern) => ({ ...modern, layoutId: nextLayoutId }));
    setSchemes((list) => list.map((scheme) => (
      scheme.id === schemeId ? { ...scheme, layoutId: nextLayoutId } : scheme)));
  }, []);

  return {
    selected: schemes.find((scheme) => scheme.id === selectedId) ?? null,
    assignLayout,
  };
};

export { useEditorSchemes };
export type { EditorScheme, EditorSchemes } from './editor-schemes.type';
