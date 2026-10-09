/* @layer bridge-wasm @kind logic */
import { DEATH_LINK_TAG } from './online-handshake.constants';

const connectTags = (deathLink: boolean | undefined): string[] => (deathLink ? [DEATH_LINK_TAG] : []);

export { connectTags };
