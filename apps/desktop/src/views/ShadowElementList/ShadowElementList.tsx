/* @layer renderer-components @kind component */
import { Box, EmptyState, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow } from '@drizztdourden08/tessera/composites';
import { useEnsureShadowProject, useShadowScreenId } from '@app/shadow-editor';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { SHAPE_GLYPHS } from './ShadowElementList.constants';
import './ShadowElementList.css';

const ShadowElementList = () => {
  const { selectedElementId, setSelectedElement, getScreenData, heightLevels } = useShadowEditorStore();

  useEnsureShadowProject();
  const screenData = getScreenData(useShadowScreenId());

  const getHeightLabel = (h: number): string => {
    const match = heightLevels.find((l) => Math.abs(l.value - h) < 0.005);
    return match ? match.label : `H${Math.round(h * 100)}%`;
  };

  const getShapeIcon = (type: string, sides = 4) => {
    if (type === 'freehand') return <Icon name="pencil" />;
    if (sides === 4) return <Icon name="square" />;
    if (sides >= 8) return <Icon name="circle" />;
    return <Text as="span">{SHAPE_GLYPHS[sides] ?? SHAPE_GLYPHS[6]}</Text>;
  };

  return (
    <Box className="shadow-element-list">
      {screenData.heightmap.length > 0 && (
        <ListItemList heading="Shapes" count={screenData.heightmap.length}>
          {screenData.heightmap.map((el) => (
            <ListItemRow
              key={el.id}
              icon={getShapeIcon(el.shape.type, el.shape.sides)}
              name={el.shape.type === 'freehand' ? 'Freehand' : `${el.shape.sides ?? 4}-gon`}
              columns={[{ primary: getHeightLabel(el.height), align: 'end' }]}
              selected={el.id === selectedElementId}
              onClick={() => setSelectedElement(el.id, 'heightmap')}
            />
          ))}
        </ListItemList>
      )}

      {screenData.lights.length > 0 && (
        <ListItemList heading="Lights" count={screenData.lights.length}>
          {screenData.lights.map((light) => (
            <ListItemRow
              key={light.id}
              icon={<Icon name={light.type === 'point' ? 'sun' : 'square'} />}
              name={`${light.type === 'point' ? 'Point' : 'Area'} Light`}
              columns={[{ primary: `r${light.radius}`, align: 'end' }]}
              selected={light.id === selectedElementId}
              onClick={() => setSelectedElement(light.id, 'light')}
            />
          ))}
        </ListItemList>
      )}

      {screenData.heightmap.length === 0 && screenData.lights.length === 0 && (
        <EmptyState message="No elements on this screen" />
      )}
    </Box>
  );
};

export { ShadowElementList };
