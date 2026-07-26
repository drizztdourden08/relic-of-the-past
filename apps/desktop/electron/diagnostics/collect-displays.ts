/* @layer electron-main @kind logic */
/**
 * Per-monitor readout. Only the main process can see the whole desktop; the
 * renderer's `window.screen` describes the one display the window sits on, which
 * is exactly the blind spot when a report says "it's wrong on my second monitor".
 */
import { screen } from 'electron';
import type { Display } from 'electron';
import type { DisplayDiagnostics } from '@shared/types/diagnostics';

const TOUCH_LABEL: Record<string, string> = {
  available: 'touch',
  unavailable: 'none',
  unknown: 'unknown',
};

const describeDisplay = (display: Display, primaryId: number): DisplayDiagnostics => ({
  id: display.id,
  label: display.label || `display-${display.id}`,
  primary: display.id === primaryId,
  internal: display.internal,
  bounds: { ...display.bounds },
  nativeSize: {
    width: Math.round(display.size.width * display.scaleFactor),
    height: Math.round(display.size.height * display.scaleFactor),
  },
  workArea: { ...display.workArea },
  scaleFactor: display.scaleFactor,
  rotation: display.rotation,
  // 0 means "the platform did not report one" rather than a real 0 Hz.
  refreshHz: display.displayFrequency || null,
  colorDepth: display.colorDepth,
  depthPerComponent: display.depthPerComponent,
  colorSpace: display.colorSpace,
  monochrome: display.monochrome,
  touchSupport: TOUCH_LABEL[display.touchSupport] ?? display.touchSupport,
});

const collectDisplays = (): DisplayDiagnostics[] => {
  let primaryId = -1;
  try {
    primaryId = screen.getPrimaryDisplay().id;
  } catch {
    // no display server (headless CI) — every entry just reports primary: false
  }
  try {
    return screen.getAllDisplays().map((display) => describeDisplay(display, primaryId));
  } catch {
    return [];
  }
};

export { collectDisplays };
