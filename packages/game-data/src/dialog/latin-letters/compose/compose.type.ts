/* @layer shared-game @kind types */
import type { MarkArt, OverlayId } from '../latin-letters.type';

type MarkStep = { kind: 'art'; art: MarkArt } | { kind: 'overlay'; overlay: OverlayId };

export type { MarkStep };
