/* @layer store-site @kind component */
/**
 * The Publish form for one mode: the pack (and what changed in it, for a new version), the
 * listing and its pictures, the rights box, then the submit button. A red line on top counts
 * the fields still wrong once Submit is pressed, and each of them is outlined in red.
 */
import { Button } from '@ds/primitives/Button';
import { Checkbox } from '@ds/primitives/Checkbox';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { StoreItem } from '@shared/store/types';
import { STORE_LIMITS } from '@shared/store/limits';
import { navigate } from '@site-kit/router/useLocation';
import { SUBMIT_LABELS } from '../Publish.constants';
import type { PublishMode } from '../Publish.constants';
import { usePublishForm } from '../behavior/usePublishForm';
import { useScrollToFirstError } from '../behavior/useScrollToFirstError';
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
  const { shown, leave, attempts } = form.fields;
  const kind = item?.kind ?? form.pack.kind ?? 'music';
  useScrollToFirstError(attempts);

  const tickRights = (checked: boolean) => {
    form.rights.set(checked);
    leave('rights');
  };

  return (
    <Stack gap="lg" align="stretch" className="publish">
      {form.note && <Text as="p" variant="caption" role="status" className="publish__note">{form.note}</Text>}
      {form.alertLine && <Text as="p" variant="caption" role="alert" className="publish__alert">{form.alertLine}</Text>}
      {form.takesPack && <PackField pack={form.pack} error={shown.pack} onLeave={() => leave('pack')} />}
      {form.takesChanges && <ChangesField changes={form.changes} />}
      {form.takesListing && <ListingFields listing={form.listing} errors={shown} onLeave={leave} />}
      {form.takesListing && (
        <PictureField
          label={mode === 'new' ? 'Card picture' : 'Card picture, to replace'}
          size={`${CARD.width} × ${CARD.height}`}
          role="card"
          state={form.card}
          current={item?.card ?? null}
          kind={kind}
          color={form.listing.text.color}
          error={shown.card}
          onPick={() => leave('card')}
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
          color={form.listing.text.color}
          error={form.banner.error ?? undefined}
        />
      )}
      <Field error={shown.rights}>
        <Checkbox checked={form.rights.checked} onChange={tickRights} label={RIGHTS_LINE} />
      </Field>
      <Stack gap="xs" align="stretch" className="publish__footer">
        {form.error && <Text as="p" variant="caption" role="alert">{form.error}</Text>}
        <Flex gap="sm" justify="end">
          <Button variant="tertiary" disabled={form.busy} onClick={() => navigate('/publications')}>Cancel</Button>
          <Button variant="primary" disabled={form.busy || form.note !== null} onClick={form.submit}>{SUBMIT_LABELS[mode]}</Button>
        </Flex>
      </Stack>
    </Stack>
  );
};

export { PublishForm };
export type { PublishFormProps };
