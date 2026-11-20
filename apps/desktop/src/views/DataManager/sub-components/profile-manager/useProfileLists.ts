/* @layer renderer-components @kind hook */
import { useState, useEffect } from 'react';
import { readConfig } from '../../../../storage/profile-store';
import { listLanguages } from '../../../../storage/languages-store';
import { listMsuPacks } from '../../../../storage/msu-store';
import { japaneseFontImported } from '../../../../storage/sprites-store';
import type { ProfileLanguage } from '../profile-language.type';

const profileLanguages = async (): Promise<ProfileLanguage[]> => {
  const [list, fontImported] = await Promise.all([listLanguages(), japaneseFontImported()]);
  return list.map(({ code, needsJapaneseFont }) => ({ code, locked: needsJapaneseFont && !fontImported }));
};

const useProfileLists = (creating: boolean, selected: string | null) => {
  const [languages, setLanguages] = useState<ProfileLanguage[]>([]);
  const [msuPacks, setMsuPacks] = useState<Array<{ name: string }>>([]);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void profileLanguages().then(setLanguages);
    void listMsuPacks().then(setMsuPacks);
  }, [creating]);

  useEffect(() => {
    if (!selected) { setSettings(null); return; }
    void readConfig(selected).then(setSettings);
  }, [selected]);

  return { languages, msuPacks, settings };
};

export { useProfileLists };
