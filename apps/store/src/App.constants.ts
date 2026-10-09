/* @layer store-site @kind constants */
import { createElement } from 'react';
import { HookshopHighlight } from '@rotp/design/packs';
import { Barred } from './pages/Barred/Barred';

const SIGN_IN_ART_PIXEL_SIZE = 3;

const BARRED = createElement(Barred);

const SIGN_IN_ART = createElement(HookshopHighlight, { pixelSize: SIGN_IN_ART_PIXEL_SIZE });

export { BARRED, SIGN_IN_ART };
