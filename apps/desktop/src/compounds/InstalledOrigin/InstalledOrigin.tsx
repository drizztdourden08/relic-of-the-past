/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import externalLinkIcon from '@iconify-icons/lucide/external-link';
import { Box, Button, Card, Flex, Text } from '@drizztdourden08/tessera/primitives';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { licenseById } from '@rotp/hub-contracts';
import { HookshopChip } from '../HookshopChip';
import { READ_ONLY_NOTE, uninstallMessage, uninstallTitle } from './InstalledOrigin.constants';
import type { InstalledOriginProps } from './InstalledOrigin.type';
import { OriginActions } from './sub-components/OriginActions';
import { OriginFacts } from './sub-components/OriginFacts';
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

      <OriginFacts author={origin.author.displayName} semver={semver} license={license} updateTo={updateTo} />

      <OriginActions
        busy={busy}
        copyRefusal={copyRefusal}
        updateTo={updateTo}
        onDuplicate={onDuplicate}
        onUpdate={onUpdate}
        onAskUninstall={askUninstall}
      />

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
