/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import type { RefObject } from 'react';

const useAnchorRef = (anchor: HTMLElement | null): RefObject<HTMLElement | null> =>
  useMemo(() => ({ current: anchor }), [anchor]);

export { useAnchorRef };
