/* @layer store-site @kind component */
import { useState } from 'react';
import { Button } from '@ds/primitives/Button';
import { Dialog } from '@ds/composites/Dialog';
import { actionsFor } from '@shared/store/version-flow';
import { EDIT_ACTIONS, REVIEWER } from './ReviewButtons.constants';
import type { ReviewButtonsProps } from './ReviewButtons.type';

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
