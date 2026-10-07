/* @layer store-site @kind component */
/** An item's kind as the kit's pill: music, character or language, with an optional detail after it. */
import type { StoreKind } from '@shared/store/types';
import { Chip } from '@site-kit/components/Chip/Chip';
import type { ChipTone } from '@site-kit/components/Chip/Chip';
import { KIND_LABELS } from '../../lib/kinds';

type KindChipProps = {
  kind: StoreKind;
  /** Shown after the kind, as in "music · 61 tracks". */
  detail?: string;
};

const KIND_TONES: Record<StoreKind, ChipTone> = { music: 'gold', character: 'green', language: 'info' };

const KindChip = (props: KindChipProps) => {
  const { kind, detail } = props;
  return <Chip tone={KIND_TONES[kind]}>{detail ? `${KIND_LABELS[kind]} · ${detail}` : KIND_LABELS[kind]}</Chip>;
};

export { KindChip };
export type { KindChipProps };
