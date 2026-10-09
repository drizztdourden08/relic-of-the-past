/* @layer electron-main @kind logic */
import type { DisplayModeDriver } from './display-mode-driver.type';
import { loadKoffi } from './koffi-loader';
import {
  CDS_FULLSCREEN, DISP_CHANGE_SUCCESSFUL, DM_DISPLAYFREQUENCY, DM_PELSHEIGHT, DM_PELSWIDTH, ENUM_CURRENT_SETTINGS, MAX_MODES,
} from './windows.constants';
import type { DevMode, Win32Bindings } from './windows.type';

let bindings: Win32Bindings | null = null;
let bindingError = '';

const buildBindings = (): Win32Bindings | null => {
  const koffi = loadKoffi();
  if (!koffi) {
    bindingError = 'the native display binding could not be loaded';
    return null;
  }
  try {
    const user32 = koffi.load('user32.dll');
    const DEVMODEW = koffi.struct('DEVMODEW', {
      dmDeviceName: koffi.array('char16', 32),
      dmSpecVersion: 'uint16',
      dmDriverVersion: 'uint16',
      dmSize: 'uint16',
      dmDriverExtra: 'uint16',
      dmFields: 'uint32',
      dmPositionX: 'int32',
      dmPositionY: 'int32',
      dmDisplayOrientation: 'uint32',
      dmDisplayFixedOutput: 'uint32',
      dmColor: 'int16',
      dmDuplex: 'int16',
      dmYResolution: 'int16',
      dmTTOption: 'int16',
      dmCollate: 'int16',
      dmFormName: koffi.array('char16', 32),
      dmLogPixels: 'uint16',
      dmBitsPerPel: 'uint32',
      dmPelsWidth: 'uint32',
      dmPelsHeight: 'uint32',
      dmDisplayFlags: 'uint32',
      dmDisplayFrequency: 'uint32',
      dmICMMethod: 'uint32',
      dmICMIntent: 'uint32',
      dmMediaType: 'uint32',
      dmDitherType: 'uint32',
      dmReserved1: 'uint32',
      dmReserved2: 'uint32',
      dmPanningWidth: 'uint32',
      dmPanningHeight: 'uint32',
    });

    const enumFn = user32.func(
      'int __stdcall EnumDisplaySettingsW(const char16_t *lpszDeviceName, uint32_t iModeNum, _Inout_ DEVMODEW *lpDevMode)',
    );
    const changeFn = user32.func(
      'long __stdcall ChangeDisplaySettingsExW(const char16_t *lpszDeviceName, _In_ DEVMODEW *lpDevMode, void *hwnd, uint32_t dwflags, void *lParam)',
    );
    const sizeofDevMode = koffi.sizeof(DEVMODEW);

    return {
      sizeofDevMode,
      enumDisplaySettings: (index) => {
        const dm = { dmSize: sizeofDevMode } as DevMode;
        return enumFn(null, index, dm) ? dm : null;
      },
      changeDisplaySettings: (mode) => changeFn(null, mode, null, CDS_FULLSCREEN, null) as number,
    };
  } catch (e) {
    bindingError = `the native display binding failed to initialise (${e instanceof Error ? e.message : String(e)})`;
    return null;
  }
};

const getBindings = (): Win32Bindings | null => {
  if (bindings === null && !bindingError) bindings = buildBindings();
  return bindings;
};

const listRates = (): number[] => {
  const api = getBindings();
  if (!api) return [];
  const current = api.enumDisplaySettings(ENUM_CURRENT_SETTINGS);
  if (!current) return [];
  const rates = new Set<number>();
  for (let i = 0; i < MAX_MODES; i++) {
    const mode = api.enumDisplaySettings(i);
    if (!mode) break;
    const samePhysicalResolution = mode.dmPelsWidth === current.dmPelsWidth && mode.dmPelsHeight === current.dmPelsHeight;
    if (samePhysicalResolution) rates.add(mode.dmDisplayFrequency);
  }
  return [...rates].sort((a, b) => a - b);
};

const currentRate = (): number | null => {
  const api = getBindings();
  const mode = api?.enumDisplaySettings(ENUM_CURRENT_SETTINGS);
  return mode ? mode.dmDisplayFrequency : null;
};

const setRate = (hz: number): boolean => {
  const api = getBindings();
  if (!api) return false;
  const current = api.enumDisplaySettings(ENUM_CURRENT_SETTINGS);
  if (!current) return false;
  const target: DevMode = {
    ...current,
    dmDisplayFrequency: hz,
    dmFields: DM_PELSWIDTH | DM_PELSHEIGHT | DM_DISPLAYFREQUENCY,
  };
  return api.changeDisplaySettings(target) === DISP_CHANGE_SUCCESSFUL;
};

const createWindowsDriver = (): DisplayModeDriver => {
  const ready = getBindings() !== null;
  return {
    platform: 'win32',
    available: ready,
    unavailableReason: ready ? '' : bindingError,
    listRates,
    currentRate,
    setRate,
  };
};

export { createWindowsDriver };
