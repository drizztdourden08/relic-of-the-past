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
  lead: 'Mix the music and the effects on their own, load a whole new soundtrack, or replace any single sound in the game.',
  glow: 'forest',
  features: [
    {
      id: 'volume',
      label: 'Volume',
      short: 'Volume',
      title: 'Music and effects, apart',
      promise: ['A master volume for everything.', 'Music, ambience and effects on their own.'],
      body: 'Set one master volume, then mix the music, the ambience and the sound effects separately. Music and effects each have their own mute. Independent mixing is a switch: with it off, the sound is exactly the original mix.',
      settings: ['Master', 'Music', 'Effects'],
      caption: 'The audio settings: a master volume, and a level for music, ambience and effects.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.audio },
    },
    {
      id: 'music-packs',
      label: 'MSU Studio',
      short: 'MSU Studio',
      title: 'MSU Studio',
      promise: ['The original MSU-1 format, supported.', "Build a pack with the game's sound beside yours."],
      body: "Load MSU-1 packs in the standard format other emulators use, with the Deluxe and OPUZ variants too, or build one in MSU Studio with the game's original sound right beside yours. Every slot can be played, the game's version and your own, back to back.",
      settings: ['MSU-1', 'MSU Studio'],
      caption: 'MSU Studio with a new pack, every track slot listed.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.msuStudio },
    },
    {
      id: 'msul',
      label: '.msul',
      short: '.msul',
      title: 'Layered packs: .msul',
      promise: ['Music with layers of rain and thunder.', 'Replace every sound in the game.'],
      body: 'The new format of the app. A track can stack layers: a bed that loops, thunder at random intervals, two pieces that take turns. Each layer picks how it plays, once, looping, at random intervals or at fixed offsets. A pack can replace any sound the game makes, one at a time, from the music to the ambience to a single effect. A .msul file is one archive that keeps every layer and setting.',
      settings: ['.msul', 'Layers'],
      caption: 'Time of the Falling Rain, with its rain and thunder layers. Press play to listen.',
      layout: 'split',
      visual: {
        kind: 'audio',
        shot: UI.msulPack,
        track: {
          src: 'media/audio/msul-preview.mp3',
          title: 'Time of the Falling Rain, with its rain and thunder layers',
        },
      },
    },
  ],
};

export { AUDIO_GROUP };
