/* @layer store-site @kind component */
/**
 * One picture of the listing: what is live now (or the new one once picked, exactly as it
 * will be sent) and a drop zone to pick a new one. The size it is cut to is in the hint.
 */
import { Button } from '@ds/primitives/Button';
import { DropZone } from '@ds/primitives/DropZone';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Image } from '@ds/primitives/Image';
import type { MediaRef, StoreKind } from '@shared/store/types';
import { ItemPicture } from '../../../components/ItemPicture/ItemPicture';
import type { PictureState } from '../behavior/usePicture';

type PictureFieldProps = {
  label: string;
  hint: string;
  role: 'card' | 'banner';
  state: PictureState;
  /** The picture the listing has now, if any. */
  current: MediaRef | null;
  kind: StoreKind;
};

const IMAGE_ACCEPT = ['image/*'];

const PictureField = (props: PictureFieldProps) => {
  const { label, hint, role, state, current, kind } = props;
  const pick = (files: File[]) => {
    if (files[0]) void state.choose(files[0]);
  };
  return (
    <Field label={label} hint={hint} error={state.error ?? undefined}>
      <Flex align="start" gap="md" wrap>
        {state.preview
          ? <Image src={state.preview} alt={`New ${role}`} className={`publish__preview publish__preview--${role}`} />
          : <ItemPicture picture={current} kind={kind} role={role} className={`publish__preview publish__preview--${role}`} />}
        <Flex direction="column" gap="xs" className="publish__picture-actions">
          <DropZone accept={IMAGE_ACCEPT} variant="inline" label={state.busy ? 'Preparing...' : 'Choose a picture'} disabled={state.busy} onDrop={pick} />
          {state.picture && <Button variant="ghost" size="sm" onClick={state.clear}>Keep the current one</Button>}
        </Flex>
      </Flex>
    </Field>
  );
};

export { PictureField };
export type { PictureFieldProps };
