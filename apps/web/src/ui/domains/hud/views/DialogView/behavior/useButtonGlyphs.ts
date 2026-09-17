/* @layer renderer-hud @kind hook */
/**
 * Resolves a prompt's buttons to the pictures of the input the player is using: the active input
 * profile's binding for each SNES button. Follows profile switches and controllers plugging in or out,
 * so a prompt already on screen updates without waiting for the next message.
 */
import { useCallback, useEffect, useState } from 'react';
import type { SnesButton } from '@shared/types/controls';
import type { PromptButton } from '@shared/game/dialog/dialog-prompts';
import { getInputManager } from '../../../../../../lib/input';
import { snesButtonGlyph } from '../../../../../../lib/input/snes-button-glyph';
import type { ButtonGlyph } from '../../../../../../lib/input/snes-button-glyph';

const SNES_OF: Record<PromptButton, SnesButton> = {
  a: 'A', b: 'B', up: 'Up', down: 'Down', left: 'Left', right: 'Right',
};

const useButtonGlyphs = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const manager = getInputManager();
    const bump = (): void => setVersion((v) => v + 1);
    const offProfile = manager.onActiveProfileChange(bump);
    const offDevices = manager.onDeviceChange(bump);
    return () => { offProfile(); offDevices(); };
  }, []);

  // A profile picked on the Controls screen changes the manager without an event; asking on each call
  // reads it fresh, and the version above re-renders for the changes that do announce themselves.
  const glyphsFor = useCallback((buttons: PromptButton[]): ButtonGlyph[] => {
    const manager = getInputManager();
    const profile = manager.getProfile();
    const devices = manager.getDevices();
    return buttons.map((button) => snesButtonGlyph(profile, SNES_OF[button], devices));
  }, [version]);

  return { glyphsFor };
};

export { useButtonGlyphs };
