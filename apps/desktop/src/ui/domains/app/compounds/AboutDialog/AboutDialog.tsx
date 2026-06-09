/* @layer renderer-components @kind component */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import { Button } from '../../../../design-system/primitives/Button';
import { DialogShell } from '../../../../design-system/composites/DialogShell';
import './AboutDialog.css';
import { type AboutDialogProps } from './AboutDialog.type';

const rows = (version: string) => [
  { label: 'Version', value: version },
  { label: 'Electron', value: navigator.userAgent.match(/Electron\/([\d.]+)/)?.[1] ?? '—' },
  { label: 'Chromium', value: navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1] ?? '—' },
  { label: 'Platform', value: navigator.platform },
];

const AboutDialog = (props: AboutDialogProps) => {
  const { open, version, onClose } = props;

  const actions = <Button variant="tertiary" onClick={onClose}>Close</Button>;

  return (
    <DialogShell open={open} onClose={onClose} title="About" className="about-dialog" actions={actions}>
      <Box className="about-dialog__header">
        <Image className="about-dialog__logo" src="./logos/logo-256.png" alt="Relic of the Past" />
        <Text as="h2" className="about-dialog__title">Relic of the Past</Text>
      </Box>

      <Box className="about-dialog__body">
        {rows(version).map((row) => (
          <Box key={row.label} className="about-dialog__row">
            <Text className="about-dialog__label">{row.label}</Text>
            <Text className="about-dialog__value">{row.value}</Text>
          </Box>
        ))}
      </Box>

      <Text as="p" className="about-dialog__description">
        A modern desktop port of The Legend of Zelda: A Link to the Past, built with Electron, React, and WebAssembly.
      </Text>
    </DialogShell>
  );
};

export { AboutDialog };
