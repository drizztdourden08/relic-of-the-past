/* @layer renderer-lib @kind logic */
import type { DisplayDiagnostics } from '@app/diagnostics-types';
import type { DebugSection } from './section.type';
import { section } from './section';

const unbracedColorSpace = (raw: string): string => raw.replace(/[{}]/g, '').trim() || '-';

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
    `   Colour ${display.colorDepth}-bit (${display.depthPerComponent} bpc, ${unbracedColorSpace(display.colorSpace)})`
      + ` · touch ${display.touchSupport}`,
  ];
};

const displaysSection = (displays: DisplayDiagnostics[]): DebugSection =>
  section(`Displays (${displays.length})`, displays.flatMap(displayLines));

export { displaysSection };
