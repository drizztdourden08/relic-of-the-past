/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { UI_SHOTS as UI } from '../shots/ui-shots.constants';

const AUDIO_GROUP: FeatureGroup = {
  id: 'audio',
  numeral: 'IV',
  short: 'Audio',
  kicker: 'The sound',
  title: 'Sound you can change',
  accent: 'change',
  lead: 'Mix the music and the effects, load a new soundtrack, or swap any sound in the game.',
  glow: 'forest',
  features: [
    {
      id: 'volume',
      label: 'Volume',
      short: 'Volume',
      title: 'Music and effects, apart',
      promise: ['One master volume.', 'Music, ambience and effects on their own.'],
      body: 'Set a master volume, then mix the music, ambience and effects on their own. Turn mixing off for the original sound.',
      settings: ['Master', 'Music', 'Effects'],
      caption: 'The audio settings.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.audio },
    },
    {
      id: 'music-packs',
      label: 'MSU Studio',
      short: 'MSU Studio',
      title: 'MSU Studio',
      promise: ['The MSU-1 music format, supported.', 'Build a pack beside the original sound.'],
      body: "Load MSU-1 packs, or build your own in MSU Studio with the game's sound right beside yours.",
      settings: ['MSU-1', 'MSU Studio'],
      caption: 'MSU Studio with a new pack.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.msuStudio },
    },
    {
      id: 'msul',
      label: '.msul',
      short: '.msul',
      title: 'Layered music and sound',
      promise: ['Music and sound in layers.', 'Replace any sound in the game.'],
      body: 'The new .msul format can stack sounds, like rain with thunder on top. A pack can replace any sound in the game, not only the music.',
      settings: ['.msul', 'Layers'],
      caption: "The intro in the rain, with someone's pack and the music debugger open.",
      layout: 'split',
      visual: {
        kind: 'video',
        sound: true,
        video: { src: 'media/shots/msul-demo.mp4', poster: UI.msulDemoPoster },
        steps: [
          { at: 1, label: 'A new game starts with the pack loaded' },
          { at: 31, label: "The pack's song starts, with rain heard indoors" },
          { at: 42, label: 'Link gets up and walks to the door' },
          { at: 56, label: 'Outside: the rain switches to the outdoor sound, the song plays on' },
          { at: 58, label: 'Lightning flashes over Hyrule' },
          { at: 65.5, label: 'A thunder layer joins the music' },
          { at: 67, label: 'Thunder roars with the flash' },
          { at: 147, label: 'The song loops without a break' },
        ],
      },
    },
  ],
};

export { AUDIO_GROUP };
