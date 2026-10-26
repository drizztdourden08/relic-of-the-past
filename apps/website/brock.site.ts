/* @layer root-config @kind config */
import { defineBrockSite } from '@drizztdourden08/brock-build/site';

export default defineBrockSite({
  site: { id: 'website', name: 'Relic of the Past', brand: 'rotp' },
  ports: { offset: 8 },
  build: { nodePolyfills: false, aliases: {} },
});
