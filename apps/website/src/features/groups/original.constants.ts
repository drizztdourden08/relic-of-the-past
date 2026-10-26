/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { SHOTS } from '../shots.constants';

const ORIGINAL_GROUP: FeatureGroup = {
  id: 'original',
  kicker: 'The original',
  title: 'The classic, running natively',
  lead: 'The original game logic, reverse-engineered into C and built into a real app. No emulator in between.',
  backdrop: SHOTS['sh-01'],
  features: [
    {
      id: 'no-emulator',
      title: 'No emulator required',
      body: 'The snesrev decompilation, compiled to a desktop app: instant start, pixel-exact.',
      shot: SHOTS['sh-01'],
    },
    {
      id: 'mode-7',
      title: 'Enhanced Mode 7',
      body: 'The world map and the flight with the duck, drawn at high resolution with smooth rotation and scaling.',
      shot: SHOTS['sh-02'],
    },
    {
      id: 'no-flicker',
      title: 'No flicker',
      body: 'No 8-sprites-per-line limit, plus V-Sync for smooth scrolling.',
      shot: SHOTS['sh-03'],
    },
  ],
};

export { ORIGINAL_GROUP };
