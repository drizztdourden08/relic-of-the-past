/**
 * IPC HID Report Processing — parses raw HID reports received from
 * the main process (node-hid via IPC), applies calibration, and
 * emits structured button/axis state.
 */

import { findController } from '@shared/input/register-all';
import { applySticksCalibration, applyTriggerCalibration } from './stick-calibration';
import type { DeviceStickCalibration, TriggerCalibration } from './stick-calibration';
import type { WebHidInputState, WebHidRawReport, WebHidRawListener } from './hid-reader-types';

/** Minimal host interface — satisfied by WebHidInputReader without circular import */
interface ReportHost {
  log(msg: string): void;
  pushRawLog(entry: string): void;
  states: Map<string, WebHidInputState>;
  listeners: Set<(state: WebHidInputState) => void>;
  rawListeners: Set<WebHidRawListener>;
  diagListeners: Set<(msg: string) => void>;
  lastReportTime: Map<string, number>;
  connectedDeviceKeys: Set<string>;
  connected: boolean;
  rawReportLog: string[];
  rawLogMax: number;
  getStickCalibration(deviceKey: string): DeviceStickCalibration | undefined;
  getTriggerCalibration(deviceKey: string, axisIndex: number): TriggerCalibration | undefined;
}

interface IpcPerf {
  lastTime: number;
  gapSum: number;
  gapCount: number;
  gapMax: number;
  burstCount: number;
  logTimer: number;
}

const reportIdCounts = new Map<number, number>();

const processIpcReport = (host: ReportHost, perf: IpcPerf, deviceKey: string, vendorId: number, productId: number, data: Buffer | number[]): void => {
  if (data.length === 0) return;

  // IPC timing instrumentation
  const now = performance.now();
  if (perf.lastTime > 0) {
    const gap = now - perf.lastTime;
    perf.gapSum += gap;
    perf.gapCount++;
    if (gap > perf.gapMax) perf.gapMax = gap;
    if (gap < 1) perf.burstCount++;
  }
  perf.lastTime = now;
  if (now - perf.logTimer > 2000 && perf.gapCount > 0) {
    const avg = (perf.gapSum / perf.gapCount).toFixed(2);
    host.log(`⚡ IPC: ${perf.gapCount} reports, avg=${avg}ms, max=${perf.gapMax.toFixed(1)}ms, bursts(<1ms)=${perf.burstCount}`);
    perf.gapSum = 0; perf.gapCount = 0; perf.gapMax = 0; perf.burstCount = 0;
    perf.logTimer = now;
  }

  const reportId = data[0];
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
  const dataView = new DataView(buf.buffer, buf.byteOffset + 1, buf.byteLength - 1);

  const count = (reportIdCounts.get(reportId) ?? 0) + 1;
  reportIdCounts.set(reportId, count);
  if (count <= 3) {
    const hex = Array.from(buf.subarray(0, Math.min(buf.length, 20))).map(b => b.toString(16).padStart(2, '0')).join(' ');
    host.log(`IPC Report: id=0x${reportId.toString(16)} len=${buf.byteLength - 1} [${hex}]`);
  }

  if (host.diagListeners.size > 0 && host.rawReportLog.length < host.rawLogMax) {
    const hex = Array.from(buf.subarray(0, Math.min(buf.length, 24))).map(b => b.toString(16).padStart(2, '0')).join(' ');
    host.pushRawLog(`[IPC] ${deviceKey} id=0x${reportId.toString(16)} len=${buf.byteLength - 1} ${hex}`);
  }

  if (host.rawListeners.size > 0) {
    const raw: WebHidRawReport = { deviceKey, reportId, bytes: buf, timestamp: performance.now() };
    for (const cb of host.rawListeners) cb(raw);
  }

  const vid = vendorId.toString(16).padStart(4, '0');
  const pid = productId.toString(16).padStart(4, '0');
  host.lastReportTime.set(deviceKey, performance.now());
  if (!host.connectedDeviceKeys.has(deviceKey)) {
    host.connectedDeviceKeys.add(deviceKey);
    host.connected = true;
    host.log(`IPC device connected: ${deviceKey} (${vid}:${pid})`);
  }

  const controller = findController(vid, pid);
  let parsed: { buttons: boolean[]; axes: number[]; rawSticks?: [number, number, number, number] } | null = null;

  if (controller) {
    parsed = controller.parseReport(reportId, dataView);
    if (parsed?.rawSticks) {
      const cal = host.getStickCalibration(deviceKey);
      if (cal) {
        const [lxR, lyR, rxR, ryR] = parsed.rawSticks;
        const calibratedSticks = applySticksCalibration(lxR, lyR, rxR, ryR, cal);
        parsed.axes = [...calibratedSticks, ...parsed.axes.slice(4)];
      }
    }
    if (parsed) {
      for (let i = 4; i < parsed.axes.length; i++) {
        const tcal = host.getTriggerCalibration(deviceKey, i);
        if (tcal) parsed.axes[i] = applyTriggerCalibration(parsed.axes[i], tcal);
      }
    }
  }

  if (parsed) {
    const state: WebHidInputState = {
      deviceKey,
      buttons: parsed.buttons,
      axes: parsed.axes,
      timestamp: performance.now(),
      rawSticks: parsed.rawSticks,
      rawBytes: buf,
      reportId,
    };
    host.states.set(deviceKey, state);
    for (const cb of host.listeners) cb(state);
  } else if (count <= 3) {
    host.log(`No parser matched IPC reportId=0x${reportId.toString(16)} len=${buf.byteLength - 1}`);
  }
};

export { processIpcReport };
export type { IpcPerf, ReportHost };
