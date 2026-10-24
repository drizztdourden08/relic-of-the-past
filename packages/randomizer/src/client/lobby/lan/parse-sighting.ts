/* @layer bridge-wasm @kind logic */
import { parseBeacon, parseDiscoveryTxt } from '@archipelia/lobby-protocol';
import { base64ToBytes } from '../crypto/base64-to-bytes';
import { DOTTED_QUAD } from '../../server-host-locality.constants';
import type { LanSighting, ParsedSighting } from './lan.type';

const pickAddress = (addresses: string[], fallback: string): string =>
  addresses.find((address) => DOTTED_QUAD.test(address)) ?? addresses[0] ?? fallback;

const parseSighting = (sighting: LanSighting): ParsedSighting => {
  if (sighting.kind === 'mdns-down') return { ok: false };
  if (sighting.kind === 'mdns-up') {
    const parsed = parseDiscoveryTxt(sighting.txt);
    if (!parsed.ok) return { ok: false };
    const { name, id, protocol, ap, open } = parsed.record;
    const address = pickAddress(sighting.addresses, sighting.host);
    const server = { id, name, address, port: sighting.port, protocol, archipelagoVersion: ap, open, compatible: parsed.compatible };
    return { ok: true, server, source: 'mdns' };
  }
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(sighting.data);
  } catch {
    return { ok: false };
  }
  const parsed = parseBeacon(bytes);
  if (!parsed.ok) return { ok: false };
  const { name, id, protocol, ap, open, port } = parsed.record;
  const server = { id, name, address: sighting.address, port, protocol, archipelagoVersion: ap, open, compatible: parsed.compatible };
  return { ok: true, server, source: 'beacon' };
};

export { parseSighting };
