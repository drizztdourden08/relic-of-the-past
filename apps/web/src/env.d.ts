/* @layer renderer-other @kind config */
/// <reference types="vite/client" />

// WebUSB API type declarations (Chromium/Electron)
interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
  serialNumber?: string;
}

interface USBDeviceRequestOptions {
  filters: USBDeviceFilter[];
}

interface USBEndpoint {
  readonly endpointNumber: number;
  readonly direction: 'in' | 'out';
  readonly type: 'bulk' | 'interrupt' | 'isochronous';
  readonly packetSize: number;
}

interface USBAlternateInterface {
  readonly alternateSetting: number;
  readonly interfaceClass: number;
  readonly interfaceSubclass: number;
  readonly interfaceProtocol: number;
  readonly interfaceName: string | undefined;
  readonly endpoints: USBEndpoint[];
}

interface USBInterface {
  readonly interfaceNumber: number;
  readonly alternate: USBAlternateInterface;
  readonly alternates: USBAlternateInterface[];
  readonly claimed: boolean;
}

interface USBConfiguration {
  readonly configurationValue: number;
  readonly configurationName: string | undefined;
  readonly interfaces: USBInterface[];
}

interface USBOutTransferResult {
  readonly bytesWritten: number;
  readonly status: 'ok' | 'stall' | 'babble';
}

interface USBInTransferResult {
  readonly data: DataView | undefined;
  readonly status: 'ok' | 'stall' | 'babble';
}

interface USBDevice {
  readonly vendorId: number;
  readonly productId: number;
  readonly deviceClass: number;
  readonly deviceSubclass: number;
  readonly deviceProtocol: number;
  readonly productName: string | undefined;
  readonly manufacturerName: string | undefined;
  readonly serialNumber: string | undefined;
  readonly configuration: USBConfiguration | null;
  readonly configurations: USBConfiguration[];
  readonly opened: boolean;
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  transferOut(endpointNumber: number, data: ArrayBuffer | ArrayBufferView): Promise<USBOutTransferResult>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
}

interface USB extends EventTarget {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
}

interface Navigator {
  readonly usb: USB;
}

interface Profile {
  id: string;
  name: string;
  romFile: string;
  created: number;
  lastPlayed: number;
  language?: string;
  msuPack?: string;
  automation?: boolean;
}

interface AppState {
  lastProfileId: string | null;
}

interface ImportResult {
  success: boolean;
  romFile: string;
  error?: string;
  alreadyExists?: boolean;
}

interface RomInfo {
  romFile: string;
  hasAssets: boolean;
  assetSize: number | null;
}

type RomExtractionStatus = 'idle' | 'extracting' | 'ready' | 'failed';

interface RomDisplayInfo extends RomInfo {
  extractionStatus: RomExtractionStatus;
}

declare function Zelda3(config: Record<string, unknown>): Promise<unknown>;

interface Window {
  api: import('@shared/ipc').IpcApi;
}
