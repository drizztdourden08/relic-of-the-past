/* @layer shared-game @kind constants */
import type { AccessibilityMode } from '../accessibility.type';

const ACCESSIBILITY_KEY = 'accessibility';

const DEFAULT_ACCESSIBILITY: AccessibilityMode = 'full';

const KNOWN_ACCESSIBILITY_MODES: ReadonlySet<string> = new Set<AccessibilityMode>(['full', 'items', 'minimal']);

export { ACCESSIBILITY_KEY, DEFAULT_ACCESSIBILITY, KNOWN_ACCESSIBILITY_MODES };
