/* @layer renderer-stores @kind logic */
/**
 * Refresh-rate store. Holds one reading of the display, shared by everything that shows it.
 *
 * A store, not a hook per consumer, because the rate can CHANGE while the app runs: the
 * player switches it from the settings panel, or the OS switches it on entering fullscreen.
 * Two independent hooks would each hold a stale copy, so the title bar could still claim
 * 144 Hz while the settings panel that just changed it says 120.
 */
import { create } from 'zustand';
import type { RefreshRateInfo } from '@shared/types/display';
import { getPlatform } from '../platform/get-platform';
import { measureRefreshRate } from '../hooks/measure-refresh-rate';

const EMPTY: RefreshRateInfo = { reportedHz: null, measuredHz: null, modes: [] };

interface RefreshRateState {
  info: RefreshRateInfo;
  /** True while a read is in flight, so overlapping calls do not stack measurements. */
  reading: boolean;
  /** Re-read the host value and re-measure. Safe to call repeatedly. */
  refresh: () => Promise<void>;
}

const useRefreshRateStore = create<RefreshRateState>((set, get) => ({
  info: EMPTY,
  reading: false,
  refresh: async () => {
    if (get().reading) return;
    set({ reading: true });
    try {
      // The host value lands first and is usually enough; the measurement refines it and is the
      // only source at all on web and mobile.
      let hostInfo = EMPTY;
      try {
        hostInfo = await getPlatform().display.getRefreshRate();
      } catch {
        // Host cannot answer, but the measurement below still can.
      }
      set({ info: { ...hostInfo, measuredHz: get().info.measuredHz } });

      const measuredHz = await measureRefreshRate();
      set((state) => ({ info: { ...state.info, measuredHz } }));
    } finally {
      set({ reading: false });
    }
  },
}));

export { useRefreshRateStore };
export type { RefreshRateState };
