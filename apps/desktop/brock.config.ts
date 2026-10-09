/* @layer root-config @kind config */
import { defineBrockConfig } from '@drizztdourden08/brock-build/config';

export default defineBrockConfig({
  product: {
    id: 'relic-of-the-past',
    name: 'Relic of the Past',
    appId: 'com.relicofthepast.app',
    ports: { base: 1991 },
    description: 'A desktop port of A Link to the Past, built on a decompiled C core in WebAssembly.',
    author: { name: 'drizztdourden_', email: 'drizztdourden08@users.noreply.github.com' },
    repo: { owner: 'drizztdourden08', name: 'relic-of-the-past' },
    icons: { brand: 'rotp' },
  },
  targets: ['desktop', 'android', 'web'],
  modules: [],
  build: {
    aliases: { '@shared': '../../shared', '@domains': 'src/ui/domains', '@site-kit': '../site-kit' },
    nodePolyfills: { globals: { Buffer: true, process: true } },
  },
});
