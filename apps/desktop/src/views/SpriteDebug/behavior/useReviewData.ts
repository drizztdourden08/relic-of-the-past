/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback, useRef } from 'react';
import { SAVE_DELAY_MS } from '../SpriteDebug.constants';
import type { ReviewData, ReviewStatus, UseReviewDataParams } from '../SpriteDebug.type';
import { parseReviewData } from './parse-review-data';

const useReviewData = (params: UseReviewDataParams) => {
  const { load, save } = params;
  const [data, setData] = useState<ReviewData>({});
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void load().then((raw) => {
      setData(parseReviewData(raw));
      setLoaded(true);
    });
  }, [load]);

  const persist = useCallback((next: ReviewData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { void save(next); }, SAVE_DELAY_MS);
  }, [save]);

  const setStatus = (key: string, status: ReviewStatus) => {
    setData(prev => {
      const entry = prev[key] ?? { status: 'neutral' };
      const keepComment = status === 'bad' || status === 'yellow';
      const next = { ...prev, [key]: { ...entry, status, comment: keepComment ? (entry.comment ?? '') : undefined } };
      persist(next);
      return next;
    });
  };

  const setComment = (key: string, comment: string) => {
    setData(prev => {
      const entry = prev[key] ?? { status: 'bad' as ReviewStatus };
      const next = { ...prev, [key]: { ...entry, comment } };
      persist(next);
      return next;
    });
  };

  const reset = () => {
    setData({});
    void save({});
  };

  return { data, loaded, setStatus, setComment, reset };
};

export { useReviewData };
