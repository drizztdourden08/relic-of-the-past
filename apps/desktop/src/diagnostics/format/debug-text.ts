/* @layer renderer-lib @kind logic */
import type { DebugTextInput } from './debug-text.type';
import { renderSections } from './render-sections';
import { systemSection } from './system-section';
import { hardwareSection } from './hardware-section';
import { graphicsSection } from './graphics';
import { displaysSection } from './displays-section';
import { windowSection } from './window-section';
import { audioSection } from './audio-section';
import { inputSection } from './input-section';
import { processSection } from './process-section';

const buildDebugText = ({ header, system, renderer, userAgent }: DebugTextInput): string => {
  const body = renderSections([
    ...(system ? [systemSection(system), hardwareSection(system)] : []),
    graphicsSection(system?.gpu ?? null, renderer.webgl),
    ...(system && system.displays.length > 0 ? [displaysSection(system.displays)] : []),
    windowSection(renderer.display),
    audioSection(renderer.audio),
    inputSection(renderer.device),
    processSection(renderer.device),
  ]);
  return [header.join('\n'), body, `[User agent]\n${userAgent}`].join('\n\n');
};

export { buildDebugText };
export type { DebugTextInput };
