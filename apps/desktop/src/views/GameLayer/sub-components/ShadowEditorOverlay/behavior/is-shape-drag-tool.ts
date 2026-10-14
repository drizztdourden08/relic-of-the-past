/* @layer renderer-components @kind logic */
import type { Tool } from './overlay.type';

const isShapeDragTool = (tool: Tool): tool is 'polygon' | 'shape-light' => tool === 'polygon' || tool === 'shape-light';

export { isShapeDragTool };
