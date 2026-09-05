/* @layer renderer-lib @kind logic */
/**
 * Monitor sections: every attached display from the host, then the one the window
 * is actually on as the renderer measures it. Both are reported because a mismatch
 * between them is itself the bug in a multi-monitor or mixed-DPI report.
 */
import type { DisplayDiagnostics } from '@shared/types/diagnostics';
import type { DisplayEnvironment } from '../types';
import type { DebugSection } from './section';
import { section } from './section';
import { orDash, yesNo } from './units';

// Chromium reports the colour space as a braced struct; the braces add nothing
// once it is inside a parenthesised clause.
const colorSpace = (raw: string): string => raw.replace(/[{}]/g, '').trim() || '-';

const displayLines = (display: DisplayDiagnostics, index: number): string[] => {
  const tags = [display.primary && 'primary', display.internal ? 'internal' : 'external', display.monochrome && 'monochrome']
    .filter(Boolean)
    .join(', ');
  return [
    `${index + 1}. ${display.label} - ${tags}`,
    `   Native ${display.nativeSize.width}×${display.nativeSize.height}`
      + ` @ ${display.refreshHz ? `${display.refreshHz} Hz` : 'unreported Hz'}`
      + ` · scale ${display.scaleFactor}× · rotation ${display.rotation}°`,
    `   Logical ${display.bounds.width}×${display.bounds.height} at (${display.bounds.x},${display.bounds.y})`
      + ` · work area ${display.workArea.width}×${display.workArea.height}`,
    `   Colour ${display.colorDepth}-bit (${display.depthPerComponent} bpc, ${colorSpace(display.colorSpace)})`
      + ` · touch ${display.touchSupport}`,
  ];
};

const displaysSection = (displays: DisplayDiagnostics[]): DebugSection =>
  section(`Displays (${displays.length})`, displays.flatMap(displayLines));

const windowSection = (display: DisplayEnvironment): DebugSection => section('Window display', [
  `Screen: ${display.screen.width}×${display.screen.height} logical`
    + ` (${display.nativeScreen.width}×${display.nativeScreen.height} native) @ ${display.devicePixelRatio}×`,
  `Available: ${display.screen.availWidth}×${display.screen.availHeight}`
    + ` · viewport ${display.viewport.width}×${display.viewport.height}`,
  `Measured frame rate: ${display.refreshHz ? `${display.refreshHz} Hz` : 'not measurable'}`,
  `Colour: ${display.colorDepth}-bit (pixel depth ${display.pixelDepth})`
    + ` · gamut ${display.colorGamut} · HDR ${yesNo(display.hdr)}`,
  `Preferences: ${display.colorScheme} scheme · reduced motion ${yesNo(display.reducedMotion)}`
    + ` · orientation ${orDash(display.orientation)}`,
]);

export { displaysSection, windowSection };
