/* @layer renderer-components @kind component */
/**
 * The origin bar at the top of an editor showing an item installed from the Hookshop: where it
 * came from, who made it, its version and licence, and what can be done with it. Duplicate
 * makes an editable copy when the licence allows one, and says why not when it does not.
 * Uninstall asks first, in the bar's own dialog. Bare: the host passes the origin and runs the
 * actions.
 */
import { useCallback, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import copyIcon from '@iconify-icons/lucide/copy';
import externalLinkIcon from '@iconify-icons/lucide/external-link';
import refreshIcon from '@iconify-icons/lucide/refresh-cw';
import trashIcon from '@iconify-icons/lucide/trash-2';
import { Box, Button, Card, Flex, Text } from '@ds/primitives';
import { Dialog } from '@ds/composites/Dialog';
import { licenseById } from '@shared/store/licenses';
import { HookshopChip } from '../HookshopChip';
import { READ_ONLY_NOTE, uninstallMessage, uninstallTitle } from './InstalledOrigin.constants';
import type { InstalledOriginProps } from './InstalledOrigin.type';
import './InstalledOrigin.css';

const InstalledOrigin = (props: InstalledOriginProps) => {
  const {
    origin, semver, updateTo, copyRefusal, busy = false, error = null,
    onDuplicate, onUpdate, onOpenOnSite, onUninstall,
  } = props;
  const [confirming, setConfirming] = useState(false);
  const license = licenseById(origin.license)?.label ?? origin.license;

  const askUninstall = useCallback(() => setConfirming(true), []);
  const cancelUninstall = useCallback(() => setConfirming(false), []);
  const confirmUninstall = useCallback(() => {
    setConfirming(false);
    onUninstall();
  }, [onUninstall]);

  return (
    <Card className="installed-origin">
      <Flex align="center" gap="sm" wrap>
        <HookshopChip label="From the Hookshop" />
        <Text as="span" className="installed-origin__name">{origin.name}</Text>
        <Box className="installed-origin__spacer" />
        <Button variant="ghost" size="sm" icon={<IconifyIcon icon={externalLinkIcon} />} onClick={onOpenOnSite}>
          Open on the site
        </Button>
      </Flex>

      <Flex align="center" gap="sm" wrap className="installed-origin__facts">
        <Text as="span">{`by ${origin.author.displayName}`}</Text>
        <Text as="span">·</Text>
        <Text as="span">{`v${semver}`}</Text>
        <Text as="span">·</Text>
        <Text as="span">{license}</Text>
        {updateTo !== null && <Text as="span">·</Text>}
        {updateTo !== null && <Text as="span" className="installed-origin__update">{`v${updateTo} available`}</Text>}
      </Flex>

      <Flex align="center" gap="sm" wrap>
        <Button
          variant="secondary"
          size="sm"
          icon={<IconifyIcon icon={copyIcon} />}
          disabled={busy || copyRefusal !== null}
          onClick={onDuplicate}
        >
          Duplicate to edit
        </Button>
        {copyRefusal !== null && <Text as="span" className="installed-origin__refusal">{copyRefusal}</Text>}
        {updateTo !== null && (
          <Button variant="primary" size="sm" icon={<IconifyIcon icon={refreshIcon} />} disabled={busy} onClick={onUpdate}>
            {`Update to v${updateTo}`}
          </Button>
        )}
        <Box className="installed-origin__spacer" />
        <Button variant="danger" size="sm" icon={<IconifyIcon icon={trashIcon} />} disabled={busy} onClick={askUninstall}>
          Uninstall
        </Button>
      </Flex>

      <Text as="p" variant="caption" className="installed-origin__note">{READ_ONLY_NOTE}</Text>
      {error !== null && <Text as="p" className="installed-origin__error">{error}</Text>}

      <Dialog
        open={confirming}
        title={uninstallTitle(origin.name)}
        message={uninstallMessage(origin.name)}
        confirmLabel="Uninstall"
        variant="danger"
        onConfirm={confirmUninstall}
        onCancel={cancelUninstall}
      />
    </Card>
  );
};

export { InstalledOrigin };
