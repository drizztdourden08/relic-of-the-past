/* @layer electron-main @kind logic */
import Bonjour from 'bonjour-service';
import type { LanDiscoverySettings, LanSighting } from '@rotp/randomizer';

const textOf = (txt: unknown): Record<string, string> => {
  const entries = typeof txt === 'object' && txt !== null ? Object.entries(txt) : [];
  return Object.fromEntries(entries.filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
};

const browseMdns = (settings: LanDiscoverySettings, report: (sighting: LanSighting) => void): (() => void) => {
  const bonjour = new Bonjour();
  const browser = bonjour.find({ type: settings.mdnsType, protocol: settings.mdnsProtocol });
  browser.on('up', (service) => {
    report({
      kind: 'mdns-up',
      key: service.fqdn,
      host: service.host,
      port: service.port,
      addresses: service.addresses ?? [],
      txt: textOf(service.txt),
    });
  });
  browser.on('down', (service) => {
    report({ kind: 'mdns-down', key: service.fqdn });
  });
  return () => {
    browser.stop();
    bonjour.destroy();
  };
};

export { browseMdns };
