/* @layer renderer-lib @kind logic */
import type { InputManager } from './input-manager';

const managerInstance: { current: InputManager | null } = { current: null };

export { managerInstance };
