/* @layer store-site @kind component */
/**
 * The Publish form for one mode: the pack and what changed in it, the listing and its
 * pictures, the rights box, then the first thing still missing and the submit button.
 */
import { Button } from '@ds/primitives/Button';
import { Checkbox } from '@ds/primitives/Checkbox';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { StoreItem } from '@shared/store/types';
import { STORE_LIMITS } from '@shared/store/limits';
import { navigate } from '@site-kit/router/useLocation';
import { SUBMIT_LABELS } from '../Publish.constants';
import type { PublishMode } from '../Publish.constants';
import { usePublishForm } from '../behavior/usePublishForm';
import { ListingFields } from './ListingFields';
import { PackField } from './PackField';
import { ChangesField } from './ChangesField';
import { PictureField } from './PictureField';

type PublishFormProps = {
  mode: PublishMode;
  /** The item a version or an edit is for; null for a new item. */
  item: StoreItem | null;
};

const RIGHTS_LINE = 'I made this, or I have the right to share it, and it holds nothing I may not share.';
const { card: CARD, banner: BANNER } = STORE_LIMITS;

const PublishForm = (props: PublishFormProps) => {
  const { mode, item } = props;
  const form = usePublishForm(mode, item);
  const kind = item?.kind ?? form.pack.kind ?? 'music';

  return (
    <Stack gap="lg" align="stretch" className="publish">
      {form.takesPack && <PackField pack={form.pack} />}
      {form.takesPack && <ChangesField changes={form.changes} />}
      {form.takesListing && <ListingFields listing={form.listing} />}
      {form.takesListing && (
        <PictureField
          label={mode === 'new' ? 'Card picture' : 'Card picture, to replace'}
          size={`${CARD.width} × ${CARD.height}`}
          role="card"
          state={form.card}
          current={item?.card ?? null}
          kind={kind}
        />
      )}
      {form.takesListing && (
        <PictureField
          label="Banner, optional"
          size={`${BANNER.width} × ${BANNER.height}`}
          role="banner"
          state={form.banner}
          current={item?.banner ?? null}
          kind={kind}
        />
      )}
      <Checkbox checked={form.rights.checked} onChange={form.rights.set} label={RIGHTS_LINE} />
      <Stack gap="xs" align="stretch" className="publish__footer">
        {form.problem && <Text as="p" variant="caption" role="status" className="publish__problem">{form.problem}</Text>}
        {form.error && <Text as="p" variant="caption" role="alert">{form.error}</Text>}
        <Flex gap="sm" justify="end">
          <Button variant="tertiary" disabled={form.busy} onClick={() => navigate('/publications')}>Cancel</Button>
          <Button variant="primary" disabled={form.busy || form.problem !== null} onClick={form.submit}>{SUBMIT_LABELS[mode]}</Button>
        </Flex>
      </Stack>
    </Stack>
  );
};

export { PublishForm };
export type { PublishFormProps };
