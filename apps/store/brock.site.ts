/* @layer root-config @kind config */
import { defineBrockSite } from '@drizztdourden08/brock-build/site';

export default defineBrockSite({
  site: { id: 'store', name: 'Hookshop', brand: 'rotp' },
  ports: { offset: 6 },
  api: { portOffset: 7 },
  build: { nodePolyfills: { globals: { Buffer: true, process: true } }, aliases: {} },
});
