/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { TabBar } from '../../../../../../design-system/primitives/TabBar';
import { SectionHeader } from '../../../../../../design-system/primitives/SectionHeader';
import { FontSheet } from './sub-components/FontSheet';
import { LanguageMeta } from './sub-components/LanguageMeta';
import { DialogueLines } from './sub-components/DialogueLines';
import { useLanguageDetail } from './behavior/useLanguageDetail';
import type { LanguageDetailProps } from './language-detail.type';
import './LanguageDetail.css';

const TABS = [
  { id: 'font', label: 'Font', icon: '🔤' },
  { id: 'dialogue', label: 'Dialogue', icon: '💬' },
];

const LanguageDetail = (props: LanguageDetailProps) => {
  const { code, name } = props;
  const { pack, loading } = useLanguageDetail(code);
  const [tab, setTab] = useState('font');

  if (!code) return <Text>Select a language to inspect its font and dialogue</Text>;
  if (loading) return <Text>Loading...</Text>;
  if (!pack) return <Text>No data available for this language</Text>;

  return (
    <Box className="language-detail">
      <Text as="h3" className="detail-panel__title">{name}</Text>
      <TabBar tabs={TABS} activeTab={tab} onTabChange={setTab} />

      {tab === 'font' ? (
        <Box className="language-detail__panel">
          <SectionHeader title="Font" subtitle={`${pack.font.glyphCount} glyphs`} />
          <Box className="language-detail__font-wrap">
            <FontSheet tiles={pack.font.tiles} glyphCount={pack.font.glyphCount} />
          </Box>
          <SectionHeader title="Details" />
          <LanguageMeta meta={pack.meta} name={name} />
        </Box>
      ) : (
        <Box className="language-detail__panel">
          <DialogueLines lines={pack.lines} />
        </Box>
      )}
    </Box>
  );
};

export { LanguageDetail };
