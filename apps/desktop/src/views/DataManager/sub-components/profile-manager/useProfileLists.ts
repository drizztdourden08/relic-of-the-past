/* @layer renderer-components @kind hook */
import { useState, useEffect, useMemo } from 'react';
import { readConfig } from '../../../../storage/profile-store';
import { listLanguages, listLanguageSets } from '../../../../storage/languages-store';
import { listMsuPacks } from '../../../../storage/msu-store';
import { useJapaneseGraphicsStore } from '../../../../stores/japanese-graphics-store';
import type { ProfileLanguage } from '../profile-language.type';
import type { NamedLanguage } from './profile-manager.type';

const namedLanguages = async (): Promise<NamedLanguage[]> => {
  const [list, sets] = await Promise.all([listLanguages(), listLanguageSets()]);
  const names = new Map(sets.map((set) => [set.id, set.name]));
  return list.map((language) => ({ ...language, name: names.get(language.code) ?? language.code }));
};

const useProfileLists = (creating: boolean, selected: string | null) => {
  const [named, setNamed] = useState<NamedLanguage[]>([]);
  const [msuPacks, setMsuPacks] = useState<Array<{ name: string }>>([]);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const fontImported = useJapaneseGraphicsStore((state) => state.fontImported);

  useEffect(() => {
    void namedLanguages().then(setNamed);
    void listMsuPacks().then(setMsuPacks);
  }, [creating]);

  useEffect(() => {
    if (!selected) { setSettings(null); return; }
    void readConfig(selected).then(setSettings);
  }, [selected]);

  const languages = useMemo<ProfileLanguage[]>(
    () => named.map(({ code, name, needsJapaneseFont }) => ({ code, name, locked: needsJapaneseFont && !fontImported })),
    [named, fontImported],
  );

  return { languages, msuPacks, settings };
};

export { useProfileLists };
