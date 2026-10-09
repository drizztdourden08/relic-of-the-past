/* @layer electron-main @kind logic */
import { screen } from 'electron';
import type { Display } from 'electron';
import type { DisplayDiagnostics } from '@shared/types/diagnostics';
import { TOUCH_LABEL } from './collect-displays.constants';

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
  refreshHz: display.displayFrequency || null,
  colorDepth: display.colorDepth,
  depthPerComponent: display.depthPerComponent,
  colorSpace: display.colorSpace,
  monochrome: display.monochrome,
  touchSupport: TOUCH_LABEL[display.touchSupport] ?? display.touchSupport,
});

const primaryDisplayId = (): number => {
  try {
    return screen.getPrimaryDisplay().id;
  } catch {
    return -1;
  }
};

const collectDisplays = (): DisplayDiagnostics[] => {
  const primaryId = primaryDisplayId();
  try {
    return screen.getAllDisplays().map((display) => describeDisplay(display, primaryId));
  } catch {
    return [];
  }
};

export { collectDisplays };
