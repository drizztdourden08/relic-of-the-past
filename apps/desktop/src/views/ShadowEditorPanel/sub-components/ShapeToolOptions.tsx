/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text, SegmentedControl, Slider } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { HeightLevelPicker } from './HeightLevelPicker';
import { useT } from '@drizztdourden08/brock-react';
import { POLYGON_SIDES } from '../ShadowEditorPanel.constants';

const ShapeToolOptions = () => {
  const t = useT();
  const store = useShadowEditorStore();
  const { polygonSides, setPolygonSides, polygonCornerRadius, setPolygonCornerRadius, setCustomHeight } = store;
  const handleSidesChange = useCallback((v: string) => setPolygonSides(Number(v)), [setPolygonSides]);
  const handleHeightChange = useCallback((v: number) => setCustomHeight(v), [setCustomHeight]);

  return (
    <Box className="shadow-editor-panel__tool-opts">
      <SegmentedControl value={String(polygonSides)} options={POLYGON_SIDES.map((n) => ({ value: String(n), label: String(n), title: t('views-shadow-editor:shape.sides', { count: n }) }))} onChange={handleSidesChange} />
      <Slider
        value={polygonCornerRadius}
        min={0}
        max={32}
        step={1}
        label={t('views-shadow-editor:shape.cornerRadius')}
        onChange={setPolygonCornerRadius}
      />
      <Box className="shadow-editor-panel__subsection">
        <Text className="shadow-editor-panel__sublabel">{t('views-shadow-editor:height')}</Text>
        <HeightLevelPicker value={store.getEffectiveHeight()} onChange={handleHeightChange} />
      </Box>
    </Box>
  );
};

export { ShapeToolOptions };
