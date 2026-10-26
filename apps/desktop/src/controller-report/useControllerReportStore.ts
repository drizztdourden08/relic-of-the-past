/* @layer renderer-stores @kind hook */
import { create } from 'zustand';
import type { ControllerReportState } from './controller-report-store.type';

const useControllerReportStore = create<ControllerReportState>()((set) => ({
  deviceKey: null,
  open: (deviceKey) => set({ deviceKey }),
  close: () => set({ deviceKey: null }),
}));

export { useControllerReportStore };
