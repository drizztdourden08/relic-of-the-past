/* @layer website-site @kind logic */
import { PLATFORM_HINTS } from './platform.constants';
import type { NavigatorWithHint, Platform } from './platform.type';

const detectPlatform = (): Platform => {
  const nav: NavigatorWithHint = navigator;
  const hint = (nav.userAgentData?.platform ?? navigator.userAgent).toLowerCase();
  const match = PLATFORM_HINTS.find(([, words]) => words.some((word) => hint.includes(word)));
  return match ? match[0] : 'unknown';
};

export { detectPlatform };
