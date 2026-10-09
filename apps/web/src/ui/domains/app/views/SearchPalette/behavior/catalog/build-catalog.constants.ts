/* @layer renderer-components @kind constants */
import type { SearchSource } from '../../SearchPalette.type';
import { menuSource } from './menu-source';
import { settingsSource } from './settings-source';
import { tabSource } from './tab-source';
import { actionSource } from './action-source';

const SOURCES: SearchSource[] = [menuSource, settingsSource, tabSource, actionSource];

export { SOURCES };
