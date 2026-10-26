/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { SHOTS } from '../shots.constants';

const SEE_MORE_GROUP: FeatureGroup = {
  id: 'see-more',
  kicker: 'The view',
  title: 'See more of Hyrule',
  lead: 'Widescreen up to 18:9, a taller picture, and a modern message box, each one a switch.',
  backdrop: SHOTS['sh-04'],
  features: [
    {
      id: 'widescreen',
      title: 'Widescreen',
      body: '4:3, 3:2, 16:9, 16:10 or 18:9. Wider ratios show more of the world, not a stretched picture.',
      shot: SHOTS['sh-04'],
      compare: SHOTS['sh-05'],
    },
    {
      id: 'clean-edges',
      title: 'Clean edges',
      body: 'Edge Effect fills the borders with a soft mirror of the scene. Hide Space Beyond Walls darkens what lies past a room.',
      shot: SHOTS['sh-06'],
    },
    {
      id: 'message-box',
      title: 'A modern message box',
      body: 'Text speed, hold A, a new font, borders and patterns.',
      shot: SHOTS['sh-07'],
    },
  ],
};

export { SEE_MORE_GROUP };
