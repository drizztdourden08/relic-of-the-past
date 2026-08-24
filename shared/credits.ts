/* @layer shared-other @kind data */
/**
 * Project credits — single source of truth.
 * Keep in sync with CREDITS.md in the repository root.
 */

type UsageLevel =
  | 'original-work'
  | 'core-dependency'
  | 'data-direct'
  | 'assets-direct'
  | 'assets-modified'
  | 'logic-reference'
  | 'reference'
  | 'inspiration';

interface CreditEntry {
  name: string;
  project: string;
  description: string;
  usage: UsageLevel;
  usageNote: string;
  url?: string;
  license?: string;
}

interface CreditCategory {
  id: string;
  title: string;
  entries: CreditEntry[];
}

const USAGE_LABELS: Record<UsageLevel, string> = {
  'original-work': 'Original Work',
  'core-dependency': 'Core Dependency',
  'data-direct': 'Data Used Directly',
  'assets-direct': 'Assets Used Directly',
  'assets-modified': 'Assets Modified',
  'logic-reference': 'Logic Reference',
  'reference': 'Reference',
  'inspiration': 'Inspiration',
};

const getUsageLabel = (usage: UsageLevel): string => {
  return USAGE_LABELS[usage];
};

const CREDITS: CreditCategory[] = [
  {
    id: 'game',
    title: 'Game & Core Engine',
    entries: [
      {
        name: 'snesrev',
        project: 'zelda3',
        description: 'A reverse-engineered C reimplementation of A Link to the Past (~70k+ lines of C).',
        usage: 'core-dependency',
        usageNote: 'Vendored C codebase compiled to WebAssembly; the game engine itself.',
        url: 'https://github.com/snesrev/zelda3',
        license: 'MIT',
      },
      {
        name: 'elzo-d',
        project: 'LakeSnes',
        description: 'SNES emulator providing PPU and DSP implementation, used within zelda3 with speed optimizations.',
        usage: 'core-dependency',
        usageNote: 'PPU/DSP code included within snesrev/zelda3.',
        url: 'https://github.com/elzo-d/LakeSnes',
        license: 'MIT',
      },
      {
        name: 'spannerism',
        project: 'Zelda 3 JP Disassembly',
        description: 'Community disassembly documenting function names and variables used during the decompilation effort.',
        usage: 'reference',
        usageNote: 'Function and variable naming reference used by snesrev.',
      },
    ],
  },
  {
    id: 'launcher',
    title: 'Launcher Inspiration',
    entries: [
      {
        name: 'RadzPrower',
        project: 'Zelda-3-Launcher',
        description: 'An all-purpose GUI tool to download, extract, compile, and launch zelda3 on PC.',
        usage: 'inspiration',
        usageNote: 'UI/UX concept inspiration for wrapping zelda3 in a launcher; no code used.',
        url: 'https://github.com/RadzPrower/Zelda-3-Launcher',
        license: 'MIT',
      },
    ],
  },
  {
    id: 'controllers',
    title: 'Controller Support',
    entries: [
      {
        name: 'Sam Lantinga + contributors',
        project: 'SDL',
        description: 'Cross-platform library that handles controller input, rumble and motion sensors.',
        usage: 'core-dependency',
        usageNote: 'The entire controller layer on every platform. Built from SDL\'s official released source: linked as a shared library on desktop, and compiled into the mobile plugin along with SDL\'s own Java classes, which are taken from that same pinned release at build time rather than copied into this repository.',
        url: 'https://github.com/libsdl-org/SDL',
        license: 'Zlib',
      },
      {
        name: 'mdqinc + contributors',
        project: 'SDL_GameControllerDB',
        description: 'A community-sourced database of game controller mappings for SDL.',
        usage: 'data-direct',
        usageNote: 'Controller mapping database vendored and parsed into TypeScript controller list.',
        url: 'https://github.com/mdqinc/SDL_GameControllerDB',
        license: 'Zlib',
      },
      {
        name: 'HandHeldLegend',
        project: 'procon2tool',
        description: 'Open-source utility to enable the Switch Pro Controller 2 on Windows/Android.',
        usage: 'reference',
        usageNote: 'USB init sequence and haptic patterns studied and reimplemented in TypeScript; no code copied directly.',
        url: 'https://handheldlegend.github.io/procon2tool',
      },
      {
        name: 'RyanCopley',
        project: 'NSO-GameCube-Controller-Pairing-App',
        description: 'Tool to use the NSO GameCube controller on Windows/macOS/Linux.',
        usage: 'reference',
        usageNote: 'Studied to understand NSO GameCube controller pairing protocol; no code taken, used as debugging reference.',
        url: 'https://github.com/RyanCopley/NSO-GameCube-Controller-Pairing-App',
      },
    ],
  },
  {
    id: 'icons',
    title: 'Button & Controller Icons',
    entries: [
      {
        name: 'Kenney',
        project: 'Input Prompts',
        description: 'Free game asset pack with 1500+ controller button/stick/key SVG icons (64×64).',
        usage: 'assets-direct',
        usageNote: 'Switch, Xbox, PlayStation, GameCube, Keyboard, and Generic SVG icons used as-is for button prompts.',
        url: 'https://kenney.nl/assets/input-prompts',
        license: 'CC0',
      },
      {
        name: 'Tiago Alexander',
        project: 'SNES Controller in Sketch',
        description: 'High-fidelity SNES controller design in Sketch format.',
        usage: 'assets-modified',
        usageNote: 'Sketch file converted to Figma, individual button SVGs exported and heavily modified for SNES button prompts.',
        url: 'https://www.sketchappsources.com/free-source/4788-snes-controller-sketch-freebie-resource.html',
      },
    ],
  },
  {
    id: 'map-icons',
    title: 'Map & Entrance Icons',
    entries: [
      {
        name: 'Lorc, Delapouite & contributors',
        project: 'game-icons.net',
        description: 'Open icon set; door, cave, dungeon, fairy, shop and other entrance/map markers.',
        usage: 'assets-direct',
        usageNote: 'SVG icons used via @iconify-icons/game-icons for navigation/minimap entrance markers. Attribution required by license.',
        url: 'https://game-icons.net',
        license: 'CC BY 3.0',
      },
    ],
  },
  {
    id: 'fonts',
    title: 'Fonts',
    entries: [
      {
        name: 'Patrick H. Lauke',
        project: 'The Legend of Zelda: A Link to the Past (Ext)',
        description: 'A FontStruct recreation of the game\'s dialogue face, extended with accented characters.',
        usage: 'assets-direct',
        usageNote: 'Used as-is in the translation editor so a line is written in the shape it takes on screen. Attribution required by license; the font ships with its own LICENSE.txt and README.txt.',
        url: 'https://fontstruct.com/fontstructions/show/1534358',
        license: 'CC BY 3.0',
      },
    ],
  },
  {
    id: 'randomizer',
    title: 'Randomizer Logic',
    entries: [
      {
        name: 'Archipelago',
        project: 'Archipelago Multiworld',
        description: 'Cross-game randomizer and multiworld system with ALttP support.',
        usage: 'logic-reference',
        usageNote: 'Ruleset, region structure, check flags, and entrance naming studied and reimplemented in TypeScript; no code copied directly.',
        url: 'https://archipelago.gg',
        license: 'MIT',
      },
    ],
  },
];

export { CREDITS, getUsageLabel };
export type { CreditCategory, CreditEntry, UsageLevel };
