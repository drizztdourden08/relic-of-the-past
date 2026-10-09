/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { useShadowEditorStore } from '../../../../../../../../stores/shadow-editor-store';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import { SegmentedControl } from '../../../../../../../design-system/primitives/SegmentedControl';
import { Slider } from '../../../../../../../design-system/primitives/Slider';
import { HeightLevelPicker } from '../../shadow-editor/HeightLevelPicker';
import { POLYGON_OPTIONS } from '../ShadowEditorPanel.constants';

const ShapeToolOptions = () => {
  const store = useShadowEditorStore();
  const { polygonSides, setPolygonSides, polygonCornerRadius, setPolygonCornerRadius, setCustomHeight } = store;
  const handleSidesChange = useCallback((v: string) => setPolygonSides(Number(v)), [setPolygonSides]);
  const handleHeightChange = useCallback((v: number) => setCustomHeight(v), [setCustomHeight]);

  return (
    <Box className="shadow-editor-panel__tool-opts">
      <SegmentedControl value={String(polygonSides)} options={POLYGON_OPTIONS} onChange={handleSidesChange} />
      <Slider
        value={polygonCornerRadius}
        min={0}
        max={32}
        step={1}
        label="Corner Radius"
        onChange={setPolygonCornerRadius}
      />
      <Box className="shadow-editor-panel__subsection">
        <Text className="shadow-editor-panel__sublabel">Height</Text>
        <HeightLevelPicker value={store.getEffectiveHeight()} onChange={handleHeightChange} />
      </Box>
    </Box>
  );
};

export { ShapeToolOptions };
