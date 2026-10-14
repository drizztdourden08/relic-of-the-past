/* @layer renderer-stores @kind logic */
import type { FlexEcho, GridEcho } from './hud-editor-view-store.type';

const sameGridEcho = (was: GridEcho | null, echo: GridEcho | null): boolean =>
  was === echo || (was !== null && echo !== null && was.containerId === echo.containerId
    && was.c0 === echo.c0 && was.c1 === echo.c1 && was.r0 === echo.r0 && was.r1 === echo.r1);

const sameFlexEcho = (was: FlexEcho | null, echo: FlexEcho | null): boolean =>
  was === echo || (was !== null && echo !== null && was.containerId === echo.containerId
    && was.childIds.length === echo.childIds.length
    && was.childIds.every((id, i) => id === echo.childIds[i]));

const sameEcho = { grid: sameGridEcho, flex: sameFlexEcho };

export { sameEcho };
