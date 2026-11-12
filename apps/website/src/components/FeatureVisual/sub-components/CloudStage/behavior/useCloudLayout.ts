/* @layer website-site @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { TONE_COUNT, TRIANGLE_COUNT, TRIFORCE_RATIO, WRAP_MIN_CHARS } from '../CloudStage.constants';
import type { CloudFontRange, CloudItem, CloudLayout, CloudPlacement, CloudTriangle } from '../CloudStage.type';
import { dealWords } from './deal-words';
import { fontRangeOf } from './font-range-of';
import { layoutTriangle } from './layout-triangle';
import { measureWords } from './measure-words';
import { relocateWord } from './relocate-word';
import { trianglesOf } from './triangles-of';

const useCloudLayout = (stageRef: RefObject<HTMLElement | null>, words: readonly string[]): CloudLayout => {
  const [placements, setPlacements] = useState<CloudPlacement[]>([]);
  const trianglesRef = useRef<CloudTriangle[]>([]);
  const rangeRef = useRef<CloudFontRange>({ min: 0, max: 0 });
  const relocate = useCallback((word: string): void => setPlacements((current) => relocateWord(current, word, trianglesRef.current, rangeRef.current)), []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    let live = true;
    const layout = (): void => {
      const width = stage.clientWidth;
      if (width === 0) return;
      const ratios = measureWords(stage, words);
      const items: CloudItem[] = words.map((word) => {
        const measure = ratios.get(word);
        const wrapped = word.length >= WRAP_MIN_CHARS && Boolean(measure?.wrapped);
        return { word, wrapped, ratio: (wrapped ? measure?.wrapped : measure?.single) ?? { width: 0, height: 0 } };
      });
      const triangles = trianglesOf(width, width * TRIFORCE_RATIO);
      trianglesRef.current = triangles;
      const range = fontRangeOf(stage, width);
      rangeRef.current = range;

      const placed = dealWords(items, TRIANGLE_COUNT).flatMap((part, index) => (triangles[index] ? layoutTriangle(part, triangles[index], range) : []));
      setPlacements(placed.map((placement, index) => ({ ...placement, tone: index % TONE_COUNT })));
    };
    const observer = new ResizeObserver(() => {
      if (live) layout();
    });

    void document.fonts.ready.then(() => {
      if (!live) return;
      layout();
      observer.observe(stage);
    });
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [stageRef, words]);

  return { placements, relocate };
};

export { useCloudLayout };
