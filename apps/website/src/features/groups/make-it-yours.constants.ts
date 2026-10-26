/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { SHOTS } from '../shots.constants';

const MAKE_IT_YOURS_GROUP: FeatureGroup = {
  id: 'make-it-yours',
  kicker: 'The workshop',
  title: 'Make it yours',
  lead: "Music packs, languages and outfits, made in the app's studios and shared on the Hookshop.",
  backdrop: SHOTS['sh-16'],
  features: [
    {
      id: 'music-packs',
      title: 'Music packs',
      body: 'MSU-1 and .msul packs: music, ambience and sound effects.',
      shot: SHOTS['sh-14'],
    },
    {
      id: 'studios',
      title: 'Studios',
      body: "Edit Link's outfits, translate the dialogue, build your own HUD layout.",
      shot: SHOTS['sh-15'],
    },
    {
      id: 'hookshop',
      title: 'The Hookshop',
      body: 'Browse and install community packs in one click, and share your own.',
      shot: SHOTS['sh-16'],
    },
  ],
};

export { MAKE_IT_YOURS_GROUP };
