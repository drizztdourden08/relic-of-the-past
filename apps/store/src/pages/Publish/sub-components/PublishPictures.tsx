/* @layer store-site @kind component */
import { PictureField } from './PictureField';
import { BANNER, CARD } from './PublishForm.constants';
import type { PublishPicturesProps } from './PublishPictures.type';

const PublishPictures = (props: PublishPicturesProps) => {
  const { mode, item, form } = props;
  const kind = item?.kind ?? form.pack.kind ?? 'music';

  return (
    <>
      <PictureField
        label={mode === 'new' ? 'Card picture' : 'Card picture, to replace'}
        size={`${CARD.width} × ${CARD.height}`}
        role="card"
        state={form.card}
        current={item?.card ?? null}
        kind={kind}
        color={form.listing.text.color}
        error={form.fields.shown.card}
        onPick={() => form.fields.leave('card')}
      />
      <PictureField
        label="Banner, optional"
        size={`${BANNER.width} × ${BANNER.height}`}
        role="banner"
        state={form.banner}
        current={item?.banner ?? null}
        kind={kind}
        color={form.listing.text.color}
        error={form.banner.error ?? undefined}
      />
    </>
  );
};

export { PublishPictures };
