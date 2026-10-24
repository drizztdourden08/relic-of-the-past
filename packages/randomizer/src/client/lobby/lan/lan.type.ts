/* @layer bridge-wasm @kind types */
type LanSighting =
  | { kind: 'mdns-up'; key: string; host: string; port: number; addresses: string[]; txt: Record<string, string> }
  | { kind: 'mdns-down'; key: string }
  | { kind: 'beacon'; address: string; data: string };

type LanSource = 'mdns' | 'beacon';

type LanServer = {
  id: string;
  name: string;
  address: string;
  port: number;
  protocol: number;
  archipelagoVersion: string;
  open: boolean;
  compatible: boolean;
  via: LanSource[];
};

type LanDiscoverySettings = {
  mdnsType: string;
  mdnsProtocol: 'tcp' | 'udp';
  beaconPort: number;
};

type LanSightingSource = {
  start: (settings: LanDiscoverySettings) => Promise<void>;
  stop: () => Promise<void>;
  onSighting: (listener: (sighting: LanSighting) => void) => () => void;
};

type LanServerList = {
  ingest: (sighting: LanSighting) => boolean;
  sweep: () => boolean;
  servers: () => LanServer[];
};

type ParsedSighting =
  | { ok: true; server: Omit<LanServer, 'via'>; source: LanSource }
  | { ok: false };

export type {
  LanDiscoverySettings,
  LanServer,
  LanServerList,
  LanSighting,
  LanSightingSource,
  LanSource,
  ParsedSighting,
};
