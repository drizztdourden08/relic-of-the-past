/* @layer shared-platform @kind logic */
import { createPlatform } from './create-platform';
import { detectHost } from './detect-host';
import type { FactoryMap, Platform } from './platform.type';

const resolvePlatform = (factories: FactoryMap): Platform => {
  const host = detectHost();
  const make = factories[host] ?? factories.web ?? factories.electron;
  if (!make) throw new Error(`No platform factory registered for host "${host}"`);
  return createPlatform(make());
};

export { resolvePlatform };
