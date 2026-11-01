/* @layer root-config @kind config */
import { defineBrockSite } from '@drizztdourden08/brock-build/site';

export default defineBrockSite({
  site: { id: 'website', name: 'Relic of the Past', brand: 'rotp' },
  ports: { offset: 8 },
  build: {
    nodePolyfills: false,
    aliases: {},
    routes: [
      {
        path: 'privacy',
        title: 'Privacy Policy | Relic of the Past',
        description: 'What the Relic of the Past app, website, Sanctuary and the Hookshop keep about you, and for how long.',
      },
      {
        path: 'terms',
        title: 'Terms of Service | Relic of the Past',
        description: 'The terms for using the Relic of the Past app, website, Sanctuary and the Hookshop.',
      },
    ],
  },
});
