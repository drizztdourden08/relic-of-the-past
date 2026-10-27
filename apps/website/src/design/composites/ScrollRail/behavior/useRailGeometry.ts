/* @layer website-site @kind hook */
import { useEffect, useState } from 'react';
import { EMPTY_GEOMETRY } from '../ScrollRail.constants';
import type { RailGeometry, ScrollRailMark } from '../ScrollRail.type';
import { measureRail } from './measure-rail';

const useRailGeometry = (marks: readonly ScrollRailMark[], rangeId: string): RailGeometry => {
  const [geometry, setGeometry] = useState<RailGeometry>(EMPTY_GEOMETRY);

  useEffect(() => {
    const measure = (): void => setGeometry(measureRail(marks, rangeId));
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    measure();
    return () => observer.disconnect();
  }, [marks, rangeId]);

  return geometry;
};

export { useRailGeometry };
