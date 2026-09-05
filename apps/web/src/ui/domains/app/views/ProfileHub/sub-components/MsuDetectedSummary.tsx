/* @layer renderer-components @kind component */
/** Read-only Auto-mode row for the Audio tab: the format read off the assigned pack, and the
 *  audio settings that follow from it. */
import type { GameSettings } from '@shared/types/settings';
import type { MsuPackProfile, ResolvedAudioConfig } from '@shared/features/msu-auto-config';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import './MsuDetectedSummary.css';

interface MsuDetectedSummaryProps {
  /** Null when no pack is assigned to this profile. */
  pack: MsuPackProfile | null;
  resolved: ResolvedAudioConfig;
}

/** The pack formats, named the way the wider MSU community names them. */
const MODE_LABELS: Record<GameSettings['enableMSU'], string> = {
  false: 'Off',
  true: 'MSU',
  deluxe: 'Deluxe',
  opuz: 'OPUZ',
  'deluxe-opuz': 'Deluxe OPUZ',
  msul: 'MSUL',
};

/**
 * What else is true about the pack beyond its format name. A layered pack reports as MSUL, but
 * its track numbering and audio format still matter and would otherwise go unmentioned.
 */
const packDetail = (pack: MsuPackProfile, resolved: ResolvedAudioConfig): string => {
  const parts: string[] = [];
  if (pack.isLayered) {
    parts.push('layered');
    if (pack.isDeluxe) parts.push('extended slots');
  }
  parts.push(`${resolved.audioFreq} Hz`);
  parts.push(resolved.audioChannels === 1 ? 'Mono' : 'Stereo');
  return parts.join(' · ');
};

const MsuDetectedSummary = (props: MsuDetectedSummaryProps) => {
  const { pack, resolved } = props;
  const label = pack ? MODE_LABELS[resolved.enableMSU] : 'None';

  return (
    <Box className="msu-detected">
      <Box className="msu-detected__header">
        <Text as="span" className="msu-detected__label">Pack Format</Text>
        <Text as="span" className="msu-detected__description">
          {pack
            ? 'Read from the pack assigned to this profile.'
            : 'No pack assigned to this profile. Assign one in Data Manager.'}
        </Text>
      </Box>
      <Box className="msu-detected__value">
        <Text as="span" className={`msu-detected__mode ${pack ? '' : 'msu-detected__mode--off'}`}>
          {label}
        </Text>
        {pack && <Text as="span" className="msu-detected__meta">{packDetail(pack, resolved)}</Text>}
      </Box>
    </Box>
  );
};

export { MsuDetectedSummary };
