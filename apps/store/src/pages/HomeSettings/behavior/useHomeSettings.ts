/* @layer store-site @kind hook */
/**
 * The home page's two settings, read from GET /home and saved on their own routes: the
 * featured row as an ordered list of item ids (moved, added and removed here, then saved in
 * one call), and the welcome message's markdown.
 */
import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@site-kit/api/api-error';
import { getHome } from '../../../api/catalog-endpoints';
import { putFeatured, putWelcome } from '../../../api/review-endpoints';

type Move = -1 | 1;

const useHomeSettings = () => {
  const [featured, setFeatured] = useState<string[] | null>(null);
  const [welcome, setWelcome] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getHome().then(
      (home) => {
        if (!live) return;
        setFeatured(home.featured.map((item) => item.id));
        setWelcome(home.welcome);
      },
      (cause: unknown) => { if (live) setNotice(errorMessage(cause)); },
    );
    return () => { live = false; };
  }, []);

  const move = useCallback((id: string, by: Move) => {
    setFeatured((ids) => {
      if (!ids) return ids;
      const at = ids.indexOf(id);
      const to = at + by;
      if (at < 0 || to < 0 || to >= ids.length) return ids;
      const next = [...ids];
      [next[at], next[to]] = [next[to], next[at]];
      return next;
    });
  }, []);

  const add = useCallback((id: string) => setFeatured((ids) => (ids && !ids.includes(id) ? [...ids, id] : ids)), []);
  const remove = useCallback((id: string) => setFeatured((ids) => (ids ? ids.filter((entry) => entry !== id) : ids)), []);

  const run = useCallback(async (work: () => Promise<string>) => {
    setBusy(true);
    setNotice(null);
    try {
      setNotice(await work());
    } catch (cause) {
      setNotice(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  const saveFeatured = useCallback(() => run(async () => {
    const { itemIds } = await putFeatured({ itemIds: featured ?? [] });
    setFeatured(itemIds);
    return 'The featured row is saved. The home page shows it within a few minutes.';
  }), [run, featured]);

  const saveWelcome = useCallback(() => run(async () => {
    await putWelcome({ welcome: welcome.trim() });
    return 'The welcome message is saved.';
  }), [run, welcome]);

  return { featured, welcome, setWelcome, move, add, remove, saveFeatured, saveWelcome, busy, notice };
};

type HomeSettingsState = ReturnType<typeof useHomeSettings>;

export { useHomeSettings };
export type { HomeSettingsState };
