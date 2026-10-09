/* @layer shared-storage @kind types */
import type { MsuLayer, MsuSoundDef, SoundChannel } from '@rotp/game-data';

type LayerTransform = (layer: MsuLayer) => MsuLayer;

type SoundsByChannel = Partial<Record<SoundChannel, MsuSoundDef[]>>;

export type { LayerTransform, SoundsByChannel };
