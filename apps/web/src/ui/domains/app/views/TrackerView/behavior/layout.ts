/* @layer renderer-components @kind logic */
import type { PanelSide, PanelSettings, TrackerLayoutSettings } from '../TrackerView.type';
import { STORAGE_KEY } from '../TrackerView.constants';

const defaultPanel = (side: PanelSide = 'right', x = 100, y = 100): PanelSettings => {
  return { mode: 'docked', side, opacity: 1.0, x, y };
};

const defaultLayout = (): TrackerLayoutSettings => {
  return { combined: true, inventory: defaultPanel('right'), checks: defaultPanel('right', 150, 150) };
};

const loadLayout = (): TrackerLayoutSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultLayout(),
        ...parsed,
        inventory: { ...defaultPanel('right'), ...parsed.inventory },
        checks: { ...defaultPanel('right', 150, 150), ...parsed.checks },
      };
    }
  } catch {}
  return defaultLayout();
};

const saveLayout = (s: TrackerLayoutSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
};

export { defaultPanel, defaultLayout, loadLayout, saveLayout };
