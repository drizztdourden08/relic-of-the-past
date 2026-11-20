/* @layer shared-other @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { CreditCategory, UsageLevel } from './credits.type';
import type { Message } from '@drizztdourden08/brock-core/i18n';

const FONT_GLYPHS = '# $ % & * + / ; = @ [ \\ ] ^ _ ` { } ~';

const USAGE_LABELS: Record<UsageLevel, Message> = {
  'original-work': msg('profiles:credits.usage.original-work'),
  'core-dependency': msg('profiles:credits.usage.core-dependency'),
  'data-direct': msg('profiles:credits.usage.data-direct'),
  'assets-direct': msg('profiles:credits.usage.assets-direct'),
  'assets-modified': msg('profiles:credits.usage.assets-modified'),
  'logic-port': msg('profiles:credits.usage.logic-port'),
  'logic-reference': msg('profiles:credits.usage.logic-reference'),
  reference: msg('profiles:credits.usage.reference'),
  inspiration: msg('profiles:credits.usage.inspiration'),
};

const CREDITS: CreditCategory[] = [
  {
    id: 'game',
    title: msg('profiles:credits.cat.game'),
    entries: [
      {
        name: 'snesrev',
        project: 'zelda3',
        description: msg('profiles:credits.e.0-0.d'),
        usage: 'core-dependency',
        usageNote: msg('profiles:credits.e.0-0.n'),
        url: 'https://github.com/snesrev/zelda3',
        license: 'MIT',
      },
      {
        name: 'elzo-d',
        project: 'LakeSnes',
        description: msg('profiles:credits.e.0-1.d'),
        usage: 'core-dependency',
        usageNote: msg('profiles:credits.e.0-1.n'),
        url: 'https://github.com/elzo-d/LakeSnes',
        license: 'MIT',
      },
      {
        name: 'spannerism',
        project: 'Zelda 3 JP Disassembly',
        description: msg('profiles:credits.e.0-2.d'),
        usage: 'reference',
        usageNote: msg('profiles:credits.e.0-2.n'),
      },
    ],
  },
  {
    id: 'launcher',
    title: msg('profiles:credits.cat.launcher'),
    entries: [
      {
        name: 'RadzPrower',
        project: 'Zelda-3-Launcher',
        description: msg('profiles:credits.e.1-0.d'),
        usage: 'inspiration',
        usageNote: msg('profiles:credits.e.1-0.n'),
        url: 'https://github.com/RadzPrower/Zelda-3-Launcher',
        license: 'MIT',
      },
    ],
  },
  {
    id: 'controllers',
    title: msg('profiles:credits.cat.controllers'),
    entries: [
      {
        name: 'Sam Lantinga + contributors',
        project: 'SDL',
        description: msg('profiles:credits.e.2-0.d'),
        usage: 'core-dependency',
        usageNote: msg('profiles:credits.e.2-0.n'),
        url: 'https://github.com/libsdl-org/SDL',
        license: 'Zlib',
      },
      {
        name: 'mdqinc + contributors',
        project: 'SDL_GameControllerDB',
        description: msg('profiles:credits.e.2-1.d'),
        usage: 'data-direct',
        usageNote: msg('profiles:credits.e.2-1.n'),
        url: 'https://github.com/mdqinc/SDL_GameControllerDB',
        license: 'Zlib',
      },
      {
        name: 'HandHeldLegend',
        project: 'procon2tool',
        description: msg('profiles:credits.e.2-2.d'),
        usage: 'reference',
        usageNote: msg('profiles:credits.e.2-2.n'),
        url: 'https://handheldlegend.github.io/procon2tool',
      },
      {
        name: 'RyanCopley',
        project: 'NSO-GameCube-Controller-Pairing-App',
        description: msg('profiles:credits.e.2-3.d'),
        usage: 'reference',
        usageNote: msg('profiles:credits.e.2-3.n'),
        url: 'https://github.com/RyanCopley/NSO-GameCube-Controller-Pairing-App',
      },
    ],
  },
  {
    id: 'icons',
    title: msg('profiles:credits.cat.icons'),
    entries: [
      {
        name: 'Kenney',
        project: 'Input Prompts',
        description: msg('profiles:credits.e.3-0.d'),
        usage: 'assets-direct',
        usageNote: msg('profiles:credits.e.3-0.n'),
        url: 'https://kenney.nl/assets/input-prompts',
        license: 'CC0',
      },
      {
        name: 'Tiago Alexander',
        project: 'SNES Controller in Sketch',
        description: msg('profiles:credits.e.3-1.d'),
        usage: 'assets-modified',
        usageNote: msg('profiles:credits.e.3-1.n'),
        url: 'https://www.sketchappsources.com/free-source/4788-snes-controller-sketch-freebie-resource.html',
      },
    ],
  },
  {
    id: 'map-icons',
    title: msg('profiles:credits.cat.map-icons'),
    entries: [
      {
        name: 'Lorc, Delapouite & contributors',
        project: 'game-icons.net',
        description: msg('profiles:credits.e.4-0.d'),
        usage: 'assets-direct',
        usageNote: msg('profiles:credits.e.4-0.n'),
        url: 'https://game-icons.net',
        license: 'CC BY 3.0',
      },
    ],
  },
  {
    id: 'fonts',
    title: msg('profiles:credits.cat.fonts'),
    entries: [
      {
        name: 'Patrick H. Lauke',
        project: 'The Legend of Zelda: A Link to the Past (Ext)',
        description: msg('profiles:credits.e.5-0.d'),
        usage: 'assets-modified',
        usageNote: msg('profiles:credits.e.5-0.n', { glyphs: FONT_GLYPHS }),
        url: 'https://fontstruct.com/fontstructions/show/1534358',
        license: 'CC BY 3.0',
      },
    ],
  },
  {
    id: 'randomizer',
    title: msg('profiles:credits.cat.randomizer'),
    entries: [
      {
        name: 'Archipelago',
        project: 'Archipelago Multiworld',
        description: msg('profiles:credits.e.6-0.d'),
        usage: 'logic-port',
        usageNote: msg('profiles:credits.e.6-0.n'),
        url: 'https://archipelago.gg',
        license: 'MIT',
      },
    ],
  },
  {
    id: 'randomizer-art',
    title: msg('profiles:credits.cat.randomizer-art'),
    entries: [
      {
        name: 'Efracrafting',
        project: 'Randomizer Item Icons',
        description: msg('profiles:credits.e.7-0.d'),
        usage: 'original-work',
        usageNote: msg('profiles:credits.e.7-0.n'),
      },
    ],
  },
];

export { CREDITS, USAGE_LABELS };
