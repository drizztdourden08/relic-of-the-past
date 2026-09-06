/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import { Button } from '../../../../design-system/primitives/Button';
import { useAboutInfo } from './behavior/useAboutInfo';
import { useDebugText } from '@app/lib/diagnostics';
import './About.css';

const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* best effort */ }
    document.body.removeChild(ta);
  }
};

/** About page content (rendered inside a FullScreenLayer by the PageRouter). */
const About = () => {
  const { rows, buildDebugText } = useAboutInfo();
  const { debugText } = useDebugText(buildDebugText);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!debugText) return;
    await copyText(debugText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [debugText]);

  return (
    <Box className="about">
      <Box className="about__header">
        <Image className="about__logo" src="./logos/logo-256.png" alt="Relic of the Past" />
        <Text as="h2" className="about__title">Relic of the Past</Text>
      </Box>

      <Box className="about__body">
        {rows.map((row) => (
          <Box key={row.label} className="about__row">
            <Text className="about__label">{row.label}</Text>
            <Text className="about__value">{row.value}</Text>
          </Box>
        ))}
      </Box>

      <Button variant="secondary" className="about__copy" onClick={handleCopy} disabled={!debugText}>
        {copied ? '✓ Copied' : debugText ? 'Copy debug info' : 'Collecting...'}
      </Button>

      <Text as="p" className="about__description">
        This is an unofficial fan-made/open-source project. It is not affiliated with, endorsed by,
        sponsored by, or approved by Nintendo. Nintendo, The Legend of Zelda, and related names,
        characters, music, artwork, and assets are trademarks and/or copyrights of Nintendo. No
        Nintendo-owned game assets are included in this repository.
      </Text>
    </Box>
  );
};

export { About };
