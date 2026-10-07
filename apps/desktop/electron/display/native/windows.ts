/* @layer electron-main @kind logic */
/**
 * Windows refresh-rate driver, via user32 through koffi.
 *
 * Two things learned the hard way and encoded here:
 *  - Electron reports DIPs while the OS reports physical pixels (a 4K screen at 200% scaling
 *    is 1920x1080 to Electron and 3840x2160 to user32), so mode matching must use the values
 *    read back from EnumDisplaySettingsW, never Electron's display size.
 *  - Windows rounds rates to whole numbers, reporting 119 and 120 instead of 119.88.
 *
 * CDS_FULLSCREEN asks Windows to treat the change as belonging to this process, so the
 * original mode comes back on its own if we crash instead of leaving the user stranded.
 */
import type { DisplayModeDriver } from './types';
import { loadKoffi } from './koffi-loader';

const ENUM_CURRENT_SETTINGS = 0xFFFFFFFF;
const CDS_FULLSCREEN = 0x00000004;
const DISP_CHANGE_SUCCESSFUL = 0;
/** Every resolution x rate x depth pair is its own entry, so the list is long. */
const MAX_MODES = 20000;

interface DevMode {
  dmSize: number;
  dmPelsWidth: number;
  dmPelsHeight: number;
  dmDisplayFrequency: number;
  dmFields: number;
}

interface Win32Bindings {
  enumDisplaySettings: (index: number) => DevMode | null;
  changeDisplaySettings: (mode: DevMode) => number;
  sizeofDevMode: number;
}

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
    const sizeofDevMode = koffi.sizeof(DEVMODEW) as number;

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
    // Physical pixels on both sides of this comparison. See the header note.
    if (mode.dmPelsWidth === current.dmPelsWidth && mode.dmPelsHeight === current.dmPelsHeight) {
      rates.add(mode.dmDisplayFrequency);
    }
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
  // Ask for the rate while restating the resolution, so a driver that ignores a partial
  // DEVMODE cannot reinterpret this as a resolution change.
  const DM_PELSWIDTH = 0x00080000;
  const DM_PELSHEIGHT = 0x00100000;
  const DM_DISPLAYFREQUENCY = 0x00400000;
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
