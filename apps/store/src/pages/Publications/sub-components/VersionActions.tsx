/* @layer store-site @kind component */
/**
 * The buttons an author has on one version, read from the version flow table: Send for
 * review on a ready version, Resubmit on a rejected one while its file is kept, Withdraw on
 * a waiting one, Cancel upload on one still uploading, and Delete, which asks first. An
 * approved version with its file offers Download.
 */
import { useState } from 'react';
import { Button } from '@ds/primitives/Button';
import { Dialog } from '@ds/composites/Dialog';
import type { StoreItem, StoreVersion } from '@shared/store/types';
import { actionsFor } from '@shared/store/version-flow';
import type { Actor } from '@shared/store/version-flow';
import type { PublicationActions } from '../behavior/usePublicationActions';

type VersionActionsProps = {
  item: StoreItem;
  version: StoreVersion;
  actions: PublicationActions;
};

const AUTHOR: readonly Actor[] = ['author'];

const deleteMessage = (item: StoreItem, version: StoreVersion): string =>
  `Delete ${version.semver} of "${item.name}"? Its file is removed from the store and cannot come back. The row stays in your history, and you can upload a new version.`;

const VersionActions = (props: VersionActionsProps) => {
  const { item, version, actions } = props;
  const [confirming, setConfirming] = useState(false);
  const allowed = actionsFor(version, AUTHOR);
  const { busy } = actions;

  return (
    <>
      {allowed.includes('submit') && (
        <Button variant="primary" size="sm" disabled={busy} onClick={() => void actions.submit(item.id, version.n)}>
          {version.review.state === 'rejected' ? 'Resubmit' : 'Send for review'}
        </Button>
      )}
      {allowed.includes('withdraw') && (
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => void actions.withdraw(item.id, version.n)}>Withdraw</Button>
      )}
      {version.review.state === 'approved' && !version.removed && (
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => void actions.download(item.id, version.n)}>Download</Button>
      )}
      {allowed.includes('abort') && (
        <Button variant="danger" size="sm" disabled={busy} onClick={() => void actions.abort(item.id, version.n)}>Cancel upload</Button>
      )}
      {allowed.includes('delete') && (
        <Button variant="danger" size="sm" disabled={busy} onClick={() => setConfirming(true)}>Delete</Button>
      )}
      <Dialog
        open={confirming}
        title="Delete version"
        message={deleteMessage(item, version)}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setConfirming(false); void actions.remove(item.id, version.n); }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
};

export { VersionActions };
export type { VersionActionsProps };
