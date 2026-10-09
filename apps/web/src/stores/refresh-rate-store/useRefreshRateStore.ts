/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { measureRefreshRate } from '../../hooks/measure-refresh-rate';
import type { RefreshRateState } from './refresh-rate-store.type';
import { EMPTY_REFRESH_RATE } from './refresh-rate-store.constants';
import { readHostRefreshRate } from './readHostRefreshRate';

const useRefreshRateStore = create<RefreshRateState>((set, get) => ({
  info: EMPTY_REFRESH_RATE,
  reading: false,
  refresh: async () => {
    if (get().reading) return;
    set({ reading: true });
    try {
      const hostInfo = await readHostRefreshRate();
      set({ info: { ...hostInfo, measuredHz: get().info.measuredHz } });

      const measuredHz = await measureRefreshRate();
      set((state) => ({ info: { ...state.info, measuredHz } }));
    } finally {
      set({ reading: false });
    }
  },
}));

export { useRefreshRateStore };
