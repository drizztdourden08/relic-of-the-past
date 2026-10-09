/* @layer root-config @kind config */
import { defineBrockSite } from '@drizztdourden08/brock-build/site';

export default defineBrockSite({
  site: { id: 'sanctuary', name: 'Sanctuary', brand: 'rotp' },
  ports: { offset: 2 },
  api: { portOffset: 3 },
  build: { nodePolyfills: false, aliases: {} },
});
