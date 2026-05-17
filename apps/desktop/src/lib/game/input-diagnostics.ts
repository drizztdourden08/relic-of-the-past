/**
 * Input Diagnostics — Collects exhaustive debug info about the controller pipeline.
 * Used by the diagnostic button on InputCalibration page.
 */

import { webHidReader } from './webhid-input-reader';
import { getInputManager } from './input-manager';

export interface InputDiagnostics {
  timestamp: string;
  // WebHID state
  webHid: {
    apiAvailable: boolean;
    readerConnected: boolean;
    devicesOpen: { vendorId: string; productId: string; productName: string; opened: boolean; collections: number }[];
    statesMap: Record<string, { buttons: boolean[]; axes: number[]; timestamp: number }>;
    diagLog: string[];
    grantedDevices: { vendorId: string; productId: string; productName: string; opened: boolean }[];
    autoConnectResult?: string;
  };
  // Electron node-hid enumeration (OS-level)
  nodeHid: { vendorId: string; productId: string; product: string; manufacturer: string }[];
  // Gamepad API
  gamepadApi: {
    gamepads: { index: number; id: string; connected: boolean; mapping: string; buttons: number; axes: number; anyPressed: boolean }[];
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
    webHid: {
      apiAvailable: false,
      readerConnected: false,
      devicesOpen: [],
      statesMap: {},
      diagLog: [],
      grantedDevices: [],
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

  // ─── WebHID API ───
  try {
    diag.webHid.apiAvailable = 'hid' in navigator;
    diag.webHid.readerConnected = webHidReader.isConnected();
    diag.webHid.diagLog = webHidReader.getDiagLog();

    const devices = webHidReader.getDevices();
    diag.webHid.devicesOpen = devices.map(d => ({
      vendorId: `0x${d.vendorId.toString(16).padStart(4, '0')}`,
      productId: `0x${d.productId.toString(16).padStart(4, '0')}`,
      productName: d.productName || '(no name)',
      opened: d.opened,
      collections: d.collections?.length ?? 0,
    }));

    const states = webHidReader.getStates();
    for (const [key, state] of states) {
      diag.webHid.statesMap[key] = {
        buttons: state.buttons,
        axes: state.axes,
        timestamp: state.timestamp,
      };
    }

    // Check granted devices from navigator.hid.getDevices()
    if ('hid' in navigator) {
      try {
        const granted = await (navigator as any).hid.getDevices();
        diag.webHid.grantedDevices = granted.map((d: any) => ({
          vendorId: `0x${d.vendorId.toString(16).padStart(4, '0')}`,
          productId: `0x${d.productId.toString(16).padStart(4, '0')}`,
          productName: d.productName || '(no name)',
          opened: d.opened,
        }));
      } catch (e) {
        errors.push(`navigator.hid.getDevices() failed: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`WebHID section error: ${e}`);
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

  // ─── Attempt autoConnect and capture result ───
  try {
    const before = webHidReader.isConnected();
    const result = await webHidReader.autoConnect();
    const after = webHidReader.isConnected();
    diag.webHid.autoConnectResult = `before=${before} result=${result} after=${after}`;
  } catch (e) {
    diag.webHid.autoConnectResult = `ERROR: ${e}`;
  }

  diag.errors = errors;
  return diag;
}
