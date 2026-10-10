/* @layer root-config @kind config */
import { brockEslint } from '@drizztdourden08/brock-lint-config';

const COLLECTION_LOADERS = [
  'registry', 'bootstrap', 'items', 'dungeons', 'checks', 'screens', 'connections', 'actors',
  'areas', 'locations', 'regions', 'tags', 'item-groups', 'enumeration',
].map((loader) => `**/data/${loader}`);

const ONE_SOURCE_FACADE = {
  files: ['packages/game-data/src/**/*.ts'],
  ignores: ['packages/game-data/src/data/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['**/data/records/*', '**/data/records/**'],
          message: 'Read records through the facade in src/data, never a record file.',
        },
        {
          group: COLLECTION_LOADERS,
          message: "A collection loader is the facade's own input. Read it with all(kind), find or a getter from the facade.",
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
      primitivesGlobs: ['apps/desktop/src/primitives/**/*.tsx'],
      inlineStyle: [{
        files: [
          'apps/desktop/src/{primitives,composites,hud}/**/*.{ts,tsx}',
          'apps/desktop/src/compounds/{DialogBox,DialogPrompts,DialogRows,HudButton,HudCountdown,HudLife,HudMagicBar,HudNodeRenderer,HudShape,HudText,PauseAbilitiesPanel,PauseBottlePanel,PauseEquipmentPanel,PauseGearScreen,PauseHeroPortrait,PauseItemGrid,PauseItemsScreen,PauseNamePanel,PauseNavLegend,PauseProgressPanel,PauseStatusScreen}/**/*.{ts,tsx}',
          'apps/desktop/src/views/{DeliveryQueueIndicator,DialogView,EnhancedPauseView,HudLayoutView,HudUnavailableNotice,HudView,LocationNotification,PauseMenuView}/**/*.{ts,tsx}',
          'apps/desktop/src/hooks/{useHud,useLocationNotification,usePauseMenu}.ts',
        ],
        why: 'The HUD redraws the in-game interface pixel for pixel in the SNES palette, so its inline styles hold game positions and colours, not design tokens.',
      }, {
        files: [
          'apps/desktop/src/views/NavigationWidget/sub-components/{EdgeBadge,IndoorMinimap,OverworldMinimap,AnnotationLayer}.tsx',
        ],
        why: 'The minimap draws badges and overlays at the live position and span of each connection, computed per screen.',
      }, {
        files: [
          'apps/desktop/src/views/HudLayoutEditor/HudLayoutEditor.tsx',
          'apps/desktop/src/views/HudLayoutEditor/sub-components/EditorStage.tsx',
        ],
        why: 'The editor rails take the width the user drags them to, and the stage keeps the aspect ratio of the live game view.',
      }],
      glyphContent: [{
        files: ['apps/desktop/src/views/NavigationWidget/sub-components/ReqIcon.constants.ts'],
        why: 'The requirement icons of the navigation widget are emoji data, one per item requirement.',
      }],
      consoleGlobs: [
        '**/bin/**', '**/scripts/**', '**/tooling/**', '**/*.test.{ts,tsx,js,mjs}',
        'core/wasm-build/*.mjs', 'installer-stub/*.mjs', 'apps/desktop/public/logos/**/*.mjs',
        'apps/sanctuary-api/dev-server.mjs', 'apps/sanctuary-api/src/**', 'apps/store-api/src/**',
      ],
    },
    configs: [ONE_SOURCE_FACADE],
  },
};

export default brockEslint({
  presets: ['react-app'],
  ignores: ['**/.brock/**', 'core/zelda3/**', 'scripts/hooks/**'],
  extensions: [rotpExtension],
});
