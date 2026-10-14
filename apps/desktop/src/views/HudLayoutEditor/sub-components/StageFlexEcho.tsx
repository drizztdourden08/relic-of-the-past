/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { DEFAULT_GUIDE } from './StageGridEcho/StageGridEcho.constants';
import type { HudContainer } from '@rotp/hud';
import type { StageFlexEchoProps } from './StageFlexEcho.type';

const StageFlexEcho = (props: StageFlexEchoProps) => {
  const { placed, scale } = props;
  const echo = useHudEditorViewStore((s) => s.flexEcho);
  if (!echo || echo.childIds.length === 0) return null;
  const host = placed.find((node) => node.id === echo.containerId);
  const color = (host?.node as HudContainer | undefined)?.guide?.color ?? DEFAULT_GUIDE;
  const wanted = new Set(echo.childIds);

  return (
    <>
      {placed.filter((node) => wanted.has(node.id)).map((node, i) => (
        <Box
          key={i}
          className="hud-grid-echo"
          aria-hidden="true"
          style={{
            left: node.rect.x * scale,
            top: node.rect.y * scale,
            width: node.rect.w * scale,
            height: node.rect.h * scale,
            borderColor: color,
            background: `${color}22`,
          }}
        />
      ))}
    </>
  );
};

export { StageFlexEcho };
