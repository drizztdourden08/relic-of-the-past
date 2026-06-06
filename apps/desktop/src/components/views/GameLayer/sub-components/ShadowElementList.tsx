/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { useShadowEditorStore } from '../../../../stores/shadow-editor-store';
import { wasmGetViewportInfo } from '../../../../lib/game';
import './ShadowElementList.css';

const ShadowElementList = () => {
  const {
    open,
    selectedElementId,
    setSelectedElement,
    getScreenData,
    heightLevels,
  } = useShadowEditorStore();

  const getCurrentScreenId = useCallback((): number => {
    const vp = wasmGetViewportInfo();
    if (!vp) return 0;
    const col = Math.floor((vp.cameraX + 128) / 512) & 7;
    const row = Math.floor((vp.cameraY + 112) / 512) & 7;
    return row * 8 + col;
  }, []);

  if (!open) return null;

  const screenId = getCurrentScreenId();
  const screenData = getScreenData(screenId);

  // Group shapes by their height level
  const getHeightLabel = (h: number): string => {
    const match = heightLevels.find((l) => Math.abs(l.value - h) < 0.005);
    return match ? match.label : `H${Math.round(h * 100)}%`;
  };

  const getShapeIcon = (type: string, sides?: number): string => {
    if (type === 'freehand') return '✏';
    switch (sides) {
      case 3: return '△';
      case 4: return '◻';
      case 5: return '⬠';
      case 6: return '⬡';
      default: return sides && sides >= 8 ? '◯' : '⬡';
    }
  };

  return (
    <div className="shadow-element-list">
      {/* Shapes */}
      {screenData.heightmap.length > 0 && (
        <div className="shadow-element-list__group">
          <div className="shadow-element-list__group-header">
            <span className="shadow-element-list__group-icon">⬡</span>
            <span>Shapes</span>
            <span className="shadow-element-list__count">{screenData.heightmap.length}</span>
          </div>
          <div className="shadow-element-list__items">
            {screenData.heightmap.map((el) => (
              <button
                key={el.id}
                type="button"
                className={`shadow-element-list__item${el.id === selectedElementId ? ' shadow-element-list__item--active' : ''}`}
                onClick={() => setSelectedElement(el.id, 'heightmap')}
              >
                <span className="shadow-element-list__item-icon">
                  {getShapeIcon(el.shape.type, el.shape.sides)}
                </span>
                <span className="shadow-element-list__item-name">
                  {el.shape.type === 'freehand' ? 'Freehand' : `${el.shape.sides ?? 4}-gon`}
                </span>
                <span className="shadow-element-list__item-tag">
                  {getHeightLabel(el.height)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lights */}
      {screenData.lights.length > 0 && (
        <div className="shadow-element-list__group">
          <div className="shadow-element-list__group-header">
            <span className="shadow-element-list__group-icon">💡</span>
            <span>Lights</span>
            <span className="shadow-element-list__count">{screenData.lights.length}</span>
          </div>
          <div className="shadow-element-list__items">
            {screenData.lights.map((light) => (
              <button
                key={light.id}
                type="button"
                className={`shadow-element-list__item${light.id === selectedElementId ? ' shadow-element-list__item--active' : ''}`}
                onClick={() => setSelectedElement(light.id, 'light')}
              >
                <span className="shadow-element-list__item-icon">
                  {light.type === 'point' ? '💡' : '🔦'}
                </span>
                <span className="shadow-element-list__item-name">
                  {light.type === 'point' ? 'Point' : 'Area'} Light
                </span>
                <span className="shadow-element-list__item-tag">
                  r{light.radius}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {screenData.heightmap.length === 0 && screenData.lights.length === 0 && (
        <div className="shadow-element-list__empty">
          No elements on this screen
        </div>
      )}
    </div>
  );
};

export { ShadowElementList };
