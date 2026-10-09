/* @layer electron-main @kind logic */
import { screen } from 'electron';

const offscreenOrigin = (): { x: number; y: number } => {
  const displays = screen.getAllDisplays();
  const right = Math.max(...displays.map((d) => d.bounds.x + d.bounds.width));
  const top = Math.min(...displays.map((d) => d.bounds.y));
  return { x: right + 400, y: top };
};

export { offscreenOrigin };
