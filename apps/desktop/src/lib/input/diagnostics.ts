/**
 * Input Diagnostics — Collects exhaustive debug info about the controller pipeline.
 * Used by the diagnostic button on InputCalibration page.
 */

import { webHidReader } from './hid-reader';
import { getInputManager } from './input-manager';

export interface InputDiagnostics {
  timestamp: string;
  // All connected controllers (merged from all sources)
  controllers: {
    deviceKey: string;
    name: string;
    source: string; // 'node-hid' | 'gamepad-api'
    vid: string;
    pid: string;
    connected: boolean;
    opened: boolean;
    mapping?: string;
    hasHidState: boolean;
    lastButtons?: boolean[];
    lastAxes?: number[];
  }[];
  // Raw HID report log (last 100 from IPC)
  rawReportLog: string[];
  // HID reader state
  hidReader: {
    connected: boolean;
    statesMap: Record<string, { buttons: boolean[]; axes: number[]; timestamp: number }>;
    diagLog: string[];
  };
  // Electron node-hid enumeration (OS-level)
  nodeHid: { vendorId: string; productId: string; product: string; manufacturer: string }[];
  // Gamepad API
  gamepadApi: {
    gamepads: { index: number; id: string; connected: boolean; mapping: string; buttons: number; axes: number; anyPressed: boolean; buttonValues: number[] }[];
  };
  // InputManager state
  inputManager: {
    running: boolean;
    paused: boolean;
    inputSuppressed: boolean;
    activeProfileName: string | null;
    activeProfileId: string | null;
    gamepadButtonMapSize: number;
    gamepadButtonMapEntries: [number, string][];
    gamepadAxisMapSize: number;
    gamepadAxisMapEntries: [string, string][];
    keyboardMapSize: number;
    hidStatesSize: number;
    hidStatesKeys: string[];
    setInputFnSet: boolean;
    functionMappingsCount: number;
    detectedDevices: { name: string; type: string; vid?: string; pid?: string }[];
  };
  // Electron session/permission info
  electronSession: {
    userDataPath: string;
  };
  // Errors encountered during diagnostics
  errors: string[];
}

export async function collectInputDiagnostics(): Promise<InputDiagnostics> {
  const errors: string[] = [];
  const diag: InputDiagnostics = {
    timestamp: new Date().toISOString(),
    controllers: [],
    rawReportLog: [],
    hidReader: {
      connected: false,
      statesMap: {},
      diagLog: [],
    },
    nodeHid: [],
    gamepadApi: { gamepads: [] },
    inputManager: {
      running: false,
      paused: false,
      inputSuppressed: false,
      activeProfileName: null,
      activeProfileId: null,
      gamepadButtonMapSize: 0,
      gamepadButtonMapEntries: [],
      gamepadAxisMapSize: 0,
      gamepadAxisMapEntries: [],
      keyboardMapSize: 0,
      hidStatesSize: 0,
      hidStatesKeys: [],
      setInputFnSet: false,
      functionMappingsCount: 0,
      detectedDevices: [],
    },
    electronSession: { userDataPath: '' },
    errors: [],
  };

  // ─── HID Reader state ───
  try {
    diag.hidReader.connected = webHidReader.isConnected();
    diag.hidReader.diagLog = webHidReader.getDiagLog();

    const states = webHidReader.getStates();
    for (const [key, state] of states) {
      diag.hidReader.statesMap[key] = {
        buttons: state.buttons,
        axes: state.axes,
        timestamp: state.timestamp,
      };
    }
  } catch (e) {
    errors.push(`HID reader section error: ${e}`);
  }

  // ─── Node-HID (Electron main process enumeration) ───
  try {
    if (window.api?.enumerateHidDevices) {
      const nodeDevices = await window.api.enumerateHidDevices();
      diag.nodeHid = nodeDevices.map((d: any) => ({
        vendorId: d.vendorId,
        productId: d.productId,
        product: d.product,
        manufacturer: d.manufacturer,
      }));
    } else {
      errors.push('window.api.enumerateHidDevices not available');
    }
  } catch (e) {
    errors.push(`Node-HID enumeration error: ${e}`);
  }

  // ─── Gamepad API ───
  try {
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (!gp) continue;
      diag.gamepadApi.gamepads.push({
        index: gp.index,
        id: gp.id,
        connected: gp.connected,
        mapping: gp.mapping,
        buttons: gp.buttons.length,
        axes: gp.axes.length,
        anyPressed: gp.buttons.some(b => b.pressed),
        buttonValues: gp.buttons.map(b => b.value),
      });
    }
  } catch (e) {
    errors.push(`Gamepad API error: ${e}`);
  }

  // ─── InputManager ───
  try {
    const im = getInputManager();
    // Access private members via cast for diagnostics
    const imAny = im as any;
    diag.inputManager.running = imAny.running ?? false;
    diag.inputManager.paused = imAny.paused ?? false;
    diag.inputManager.inputSuppressed = imAny.inputSuppressed ?? false;
    diag.inputManager.activeProfileName = imAny.activeProfile?.name ?? null;
    diag.inputManager.activeProfileId = imAny.activeProfile?.id ?? null;

    const btnMap: Map<number, string> = imAny.gamepadButtonMap ?? new Map();
    diag.inputManager.gamepadButtonMapSize = btnMap.size;
    diag.inputManager.gamepadButtonMapEntries = [...btnMap.entries()];

    const axisMap: Map<string, string> = imAny.gamepadAxisMap ?? new Map();
    diag.inputManager.gamepadAxisMapSize = axisMap.size;
    diag.inputManager.gamepadAxisMapEntries = [...axisMap.entries()];

    const kbMap: Map<string, string> = imAny.keyboardMap ?? new Map();
    diag.inputManager.keyboardMapSize = kbMap.size;

    const hidStates: Map<string, any> = imAny.hidStates ?? new Map();
    diag.inputManager.hidStatesSize = hidStates.size;
    diag.inputManager.hidStatesKeys = [...hidStates.keys()];

    diag.inputManager.setInputFnSet = !!imAny.setInputFn;
    diag.inputManager.functionMappingsCount = imAny.functionMappings?.length ?? 0;

    // Detected devices
    const devices = im.getDevices();
    diag.inputManager.detectedDevices = devices.map(d => ({
      name: d.name,
      type: d.type,
      vid: d.vid,
      pid: d.pid,
    }));
  } catch (e) {
    errors.push(`InputManager error: ${e}`);
  }

  // ─── Electron session ───
  try {
    if (window.api?.getAppPaths) {
      const paths = await window.api.getAppPaths();
      diag.electronSession.userDataPath = (paths as any).userData ?? '';
    }
  } catch (e) {
    errors.push(`Electron paths error: ${e}`);
  }

  diag.errors = errors;

  // ─── Merged controllers list ───
  const seen = new Set<string>();
  const hidStates = webHidReader.getStates();

  // From node-hid enumeration
  for (const d of diag.nodeHid) {
    const key = `${d.vendorId}:${d.productId}`;
    const st = hidStates.get(key);
    seen.add(key);
    diag.controllers.push({
      deviceKey: key,
      name: d.product || 'Unknown',
      source: 'node-hid',
      vid: d.vendorId,
      pid: d.productId,
      connected: true,
      opened: !!st,
      hasHidState: !!st,
      lastButtons: st?.buttons,
      lastAxes: st?.axes,
    });
  }

  // From Gamepad API
  for (const gp of diag.gamepadApi.gamepads) {
    diag.controllers.push({
      deviceKey: `gamepad-${gp.index}`,
      name: gp.id,
      source: 'gamepad-api',
      vid: '',
      pid: '',
      connected: gp.connected,
      opened: true,
      mapping: gp.mapping,
      hasHidState: false,
      lastButtons: undefined,
      lastAxes: undefined,
    });
  }

  // ─── Raw report log (last 100) ───
  diag.rawReportLog = webHidReader.getRawReportLog();

  return diag;
}
