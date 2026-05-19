import { app, ipcMain } from 'electron';
import { getMainWindow } from './create-window';

let lockedRatio = 0;
let lockedExtraHeight = 0;

function registerAspectRatioHandlers(): void {
  ipcMain.on('window:setAspectRatioLock', (_e, ratio: number, extraHeight: number) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return;
    lockedRatio = ratio;
    lockedExtraHeight = extraHeight;

    if (ratio <= 0) {
      mainWindow.setAspectRatio(0);
      return;
    }

    // Snap: shrink the window to fit the ratio. Never grow.
    const [w, h] = mainWindow.getSize();
    const contentH = h - extraHeight;
    const wForH = Math.round(contentH * ratio);
    const hForW = Math.round(w / ratio) + extraHeight;

    if (wForH <= w) {
      mainWindow.setSize(wForH, h);
      const [aw] = mainWindow.getSize();
      if (aw > w) mainWindow.setSize(w, h);
    } else if (hForW <= h) {
      mainWindow.setSize(w, hForW);
      const [, ah] = mainWindow.getSize();
      if (ah > h) mainWindow.setSize(w, h);
    }
  });

  // Manual enforcement with will-resize to correctly handle the titlebar offset.
  app.on('browser-window-created', (_event, win) => {
    win.on('will-resize', (e, newBounds, details) => {
      if (lockedRatio <= 0) return;

      const edge = details?.edge ?? '';
      const isSideH = edge === 'left' || edge === 'right';
      const isSideV = edge === 'bottom' || edge === 'top';

      let targetW: number;
      let targetH: number;

      if (isSideH) {
        targetW = newBounds.width;
        targetH = Math.round(newBounds.width / lockedRatio) + lockedExtraHeight;
      } else if (isSideV) {
        const contentH = newBounds.height - lockedExtraHeight;
        targetW = Math.round(contentH * lockedRatio);
        targetH = newBounds.height;
      } else {
        // Corner drag — fit within proposed bounds, never exceed either dimension
        const contentH = newBounds.height - lockedExtraHeight;
        const wForH = Math.round(contentH * lockedRatio);
        const hForW = Math.round(newBounds.width / lockedRatio) + lockedExtraHeight;

        if (wForH <= newBounds.width && hForW <= newBounds.height) {
          const areaW = wForH * newBounds.height;
          const areaH = newBounds.width * hForW;
          if (areaW >= areaH) {
            targetW = wForH;
            targetH = newBounds.height;
          } else {
            targetW = newBounds.width;
            targetH = hForW;
          }
        } else if (wForH <= newBounds.width) {
          targetW = wForH;
          targetH = newBounds.height;
        } else if (hForW <= newBounds.height) {
          targetW = newBounds.width;
          targetH = hForW;
        } else {
          e.preventDefault();
          return;
        }
      }

      if (targetW !== newBounds.width || targetH !== newBounds.height) {
        e.preventDefault();
        const cur = win.getBounds();
        let x = newBounds.x;
        let y = newBounds.y;
        if (edge.includes('left')) {
          x = (cur.x + cur.width) - targetW;
        }
        if (edge.includes('top')) {
          y = (cur.y + cur.height) - targetH;
        }
        win.setBounds({ x, y, width: targetW, height: targetH });
      }
    });
  });
}

export { registerAspectRatioHandlers };
