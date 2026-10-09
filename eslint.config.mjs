/* @layer root-config @kind config */
import { brockEslint } from '@drizztdourden08/brock-lint-config';

const DATA_PACKAGE = '@shared/game/data';

const COLLECTION_LOADERS = [
  'registry', 'bootstrap', 'items', 'dungeons', 'checks', 'screens', 'connections', 'actors',
  'areas', 'locations', 'regions', 'tags', 'item-groups', 'enumeration',
].map((loader) => `${DATA_PACKAGE}/${loader}`);

const ONE_SOURCE_FACADE = {
  files: ['**/*.{ts,tsx}'],
  ignores: ['shared/game/data/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: [`${DATA_PACKAGE}/records/*`, '**/game/data/records/*'],
          message: 'Read records through @shared/game/data (the facade), never a record file.',
        },
        {
          group: COLLECTION_LOADERS,
          message: 'A collection loader is the facade\'s own input. Read it with all(kind), find or a getter from @shared/game/data.',
        },
      ],
    }],
  },
};

const rotpExtension = {
  id: 'rotp',
  description: 'Relic of the Past: the dataset facade, the primitives tiers and the HUD inline styles',
  eslint: {
    options: {
      primitivesGlobs: ['**/ui/domains/hud/primitives/**/*.tsx'],
      inlineStyle: [{
        files: ['**/ui/domains/hud/**/*.{ts,tsx}'],
        why: 'The HUD redraws the in-game interface pixel for pixel in the SNES palette, so its inline styles hold game positions and colours, not design tokens.',
      }],
    },
    configs: [ONE_SOURCE_FACADE],
  },
};

export default brockEslint({
  presets: ['react-app'],
  ignores: ['**/.brock/**', 'core/zelda3/**', 'scripts/hooks/**'],
  extensions: [rotpExtension],
});
