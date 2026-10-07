/* @layer store-site @kind component */
/**
 * A reviewer's buttons on the picked entry. For a version they come from the version flow
 * table: Approve on a waiting one, Reject on a waiting or ready one (a note first), and
 * Delete, which asks first. A listing edit is approved or rejected. Unlist item stays on
 * every entry of a published item.
 */
import { useState } from 'react';
import { Button } from '@ds/primitives/Button';
import { Dialog } from '@ds/composites/Dialog';
import type { ReviewEntry } from '@shared/store/api-types';
import type { StoreVersion } from '@shared/store/types';
import { actionsFor } from '@shared/store/version-flow';
import type { Actor, VersionAction } from '@shared/store/version-flow';
import type { ReviewActions } from '../behavior/useReviewActions';

type ReviewButtonsProps = {
  entry: ReviewEntry;
  version: StoreVersion | null;
  note: string;
  actions: ReviewActions;
};

const REVIEWER: readonly Actor[] = ['reviewer'];
const EDIT_ACTIONS: readonly VersionAction[] = ['approve', 'reject'];

const ReviewButtons = (props: ReviewButtonsProps) => {
  const { entry, version, note, actions } = props;
  const [confirming, setConfirming] = useState(false);
  const allowed = version ? actionsFor(version, REVIEWER) : EDIT_ACTIONS;
  const hasNote = note.trim() !== '';
  const { busy } = actions;

  return (
    <>
      {allowed.includes('approve') && (
        <Button variant="primary" size="sm" disabled={busy} onClick={() => void actions.decide(entry, 'approve', note)}>Approve</Button>
      )}
      {allowed.includes('reject') && (
        <Button variant="danger" size="sm" disabled={busy || !hasNote} title={hasNote ? undefined : 'Write a note first'} onClick={() => void actions.decide(entry, 'reject', note)}>
          Reject
        </Button>
      )}
      {allowed.includes('delete') && (
        <Button variant="danger" size="sm" disabled={busy} onClick={() => setConfirming(true)}>Delete</Button>
      )}
      <Button variant="ghost" size="sm" disabled={busy || entry.item.status !== 'published'} onClick={() => void actions.unlist(entry)}>Unlist item</Button>
      <Dialog
        open={confirming}
        title="Delete version"
        message={version ? `Delete ${version.semver} of "${entry.item.name}"? Its file is removed from the store and the author sees that you deleted it.` : ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setConfirming(false); void actions.remove(entry); }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
};

export { ReviewButtons };
export type { ReviewButtonsProps };
