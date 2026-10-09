/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { PromptButton } from '@shared/game/dialog/dialog-prompts';
import { getInputManager } from '../../../../../../lib/input';
import { snesButtonGlyph } from '../../../../../../lib/input/snes-button-glyph';
import type { ButtonGlyph } from '../../../../../../lib/input/snes-button-glyph';
import { SNES_OF } from '../DialogView.constants';

const useButtonGlyphs = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const manager = getInputManager();
    const bump = (): void => setVersion((v) => v + 1);
    const offProfile = manager.onActiveProfileChange(bump);
    const offDevices = manager.onDeviceChange(bump);
    return () => { offProfile(); offDevices(); };
  }, []);

  const glyphsFor = useCallback((buttons: PromptButton[]): ButtonGlyph[] => {
    const manager = getInputManager();
    const profile = manager.getProfile();
    const devices = manager.getDevices();
    return buttons.map((button) => snesButtonGlyph(profile, SNES_OF[button], devices));
  }, [version]);

  return { glyphsFor };
};

export { useButtonGlyphs };
