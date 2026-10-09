/* @layer renderer-lib @kind logic */
import type { DisplayEnvironment } from '../diagnostics.type';
import type { DebugSection } from './section.type';
import { section } from './section';
import { orDash, yesNo } from './units';

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

export { windowSection };
