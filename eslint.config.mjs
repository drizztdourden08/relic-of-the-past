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
      }, {
        files: [
          'apps/store/src/components/{CropDialog,FeaturedHero,ItemPicture}/**/*.{ts,tsx}',
          'apps/store/src/components/RatingPanel/sub-components/RatingHistogram.tsx',
          'apps/store/src/pages/ReviewItem/sub-components/ListingDetails.tsx',
        ],
        why: 'The Hookshop draws values each item carries: its colour in --item-color, the crop rectangle of a picture and the share of each star in the histogram. No token can hold a value the API returns.',
      }, {
        files: [
          'packages/design/src/compounds/HookshopHighlight/HookshopHighlight.tsx',
          'packages/design/src/compounds/Hookshot/Hookshot.tsx',
        ],
        why: 'Each hookshot sprite takes the position, size and rotation computed for it per frame from the curve layout.',
      }, {
        files: [
          'apps/desktop/src/views/GameLayer/sub-components/NavigationOverlay/sub-components/{TileInspector,RectSelectionView,TileTooltipContent,LegendSwatch}.tsx',
          'apps/desktop/src/views/GameLayer/sub-components/ShadowEditorPanel/sub-components/HeightSwatch.tsx',
        ],
        why: 'The navigation overlay sits on the live game picture: the inspector takes its size, the selection box sits at tile coordinates times the live scale, the tooltip follows the pointer, a legend swatch shows the exact colour the canvas draws and a height swatch takes its opacity from the height level.',
      }, {
        files: [
          'apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/sub-components/*.tsx',
          'apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/sub-components/{BottleRack,CounterEditor,LifeEditor,MagicEditor,MagicLevelBar,MagicRows,NumberCell}.tsx',
          'apps/desktop/src/views/CheatsWidget/sub-components/PointerHintProvider.tsx',
        ],
        why: 'The cheat editors redraw the pause menu screens at the console scale, each cell at the game position its data table gives; the pointer hint follows the cursor.',
      }, {
        files: [
          'apps/desktop/src/views/InputTester/sub-components/ControllerRawBytes.tsx',
          'apps/desktop/src/views/InputTester/sub-components/hid-calibration/components/ByteChangeDot.tsx',
        ],
        why: 'Each raw byte cell is shaded by its live value, and the change dot takes its position, width and colour from the size of the change.',
      }, {
        files: [
          'packages/design/src/compounds/Mascot/Mascot.tsx',
          'packages/design/src/packs/character/compounds/{PoseCanvas/PoseCanvas,SheetBrowser/SheetBrowser}.tsx',
          'packages/design/src/packs/language/compounds/glyph/GlyphCell.tsx',
        ],
        why: 'The mascot places each piece at the angle computed for the eye and pod, the sprite canvases take the scale the user picks, and a glyph cell takes the advance width of the language pack table.',
      }, {
        files: [
          'apps/desktop/src/views/HudLayoutEditor/sub-components/{OverlayFlexSlots,OverlayGridLines,StageFlexEcho,StageSelection,RampTrack,SubsectionGroup,FontPicker,GroundPicker,OutlineRow,AlignmentTiles}.tsx',
          'apps/desktop/src/views/HudLayoutEditor/sub-components/StageGridEcho/StageGridEcho.tsx',
          'apps/desktop/src/views/HudLayoutEditor/sub-components/DragGhost/{DragGhost,sub-components/GhostCard}.tsx',
          'apps/desktop/src/views/HudLayoutEditor/sub-components/GridLattice/{GridLattice,sub-components/LatticeRow,sub-components/LatticeOccupants,sub-components/AddTrackButton,sub-components/TrackHead}.tsx',
          'apps/desktop/src/views/HudLayoutEditor/sub-components/KeyframeTrack/sub-components/KeyRail.tsx',
          'apps/desktop/src/views/HudLayoutEditor/sub-components/FlexEditor/sub-components/FlexStrip.tsx',
        ],
        why: 'The HUD layout editor draws each node where the layout engine places it on the live stage: echoes, selection and drag ghost at node and pointer positions, grid tracks and cells from the layout data, keyframe and ramp stops at their percent, swatches, fonts and sprites from the node, outline rows indented by depth, and the alignment tiles whose flex direction and justification are the option they show.',
      }, {
        files: [
          'apps/desktop/src/compounds/{DebugFloatingControls/DebugFloatingControls,SaveSlot/SaveSlot}.tsx',
          'apps/desktop/src/views/{CheckToasts/CheckToasts,GameOverlay/GameOverlay,SceneBackdrop/SceneBackdrop}.tsx',
          'apps/desktop/src/views/TitleView/sub-components/TitlePrompts.tsx',
          'apps/desktop/src/language-editor/editor-ui/{GlyphChar,sub-components/SubstitutionAtom}.tsx',
        ],
        why: 'These take a value measured or set at run time: the advance width of each game font glyph in the language editor, the position the debug controls are dragged to, the hold progress of a save slot, the play area size and notice colours from settings, the canvas size of the game overlay and the backdrop, and the title buttons placed on the title frame at game scale.',
      }],
      glyphContent: [{
        files: ['apps/desktop/src/navigation-overlay/annotation-style/annotation-style.constants.ts'],
        why: 'The navigation overlay draws each annotation as a glyph on the game canvas, where no Icon component can render, and its legend shows the same glyph.',
      }, {
        files: ['apps/desktop/src/views/NavigationWidget/sub-components/ReqIcon.constants.ts'],
        why: 'The requirement icons of the navigation widget are emoji data, one per item requirement.',
      }, {
        files: ['packages/hud/src/presets/preset-sources.constants.ts'],
        why: 'The HUD preset picker shows each preset by its game symbol (heart, diamond, key, coin), held as glyph data.',
      }],
      consoleGlobs: [
        '**/bin/**', '**/scripts/**', '**/tooling/**', '**/*.test.{ts,tsx,js,mjs}',
        'core/wasm-build/*.mjs', 'apps/desktop/public/logos/**/*.mjs',
        'packages/design/src/saved-views/put-current-view.ts',
        'apps/sanctuary-api/dev-server.mjs', 'apps/sanctuary-api/src/**', 'apps/store-api/src/**',
        'packages/hub-server/src/router/create-router.ts',
        'apps/desktop/electron/{debug,automation}/**',
        'apps/desktop/electron/lifecycle/on-window.ts',
        'apps/desktop/src/views/GameSession/behavior/{useDumpLayers,capture-layers-snapshot,run-dump-layers,useDumpNav,useSimRun,capture-hover-tooltip,log-hover-verdict,verify-hover-tile,run-full-simulation,run-sim-diagnostic,sim-flood-screen,sim-combat-sprite,run-dump-flood,dump-flood-items}.ts',
        'apps/desktop/electron/screen-editor/enumeration-writer/regenerate-types.ts',
        'packages/game-core/src/cheats/actions/cheat-start-trace.ts',
        'packages/game-core/src/webgl/gl-helpers/{create-shader,create-program}.ts',
        'packages/game-core/src/{shadow-casting,edge-glow}/renderer.ts',
        'packages/input-mapping/src/runtime/haptic-bridge/start-debug-log.ts',
        'packages/input-mapping/src/runtime/scheme-runtime/rebuild-scheme-bindings.ts',
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
