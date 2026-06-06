/**
 * Controller registry — self-registration pattern.
 * Each controller implementation imports this and calls registerController().
 * Consumers call findController() to get the implementation for a VID:PID.
 */

import type { BaseController } from './base';

const registry: BaseController[] = [];

const registerController = (ctrl: BaseController): void => {
  registry.push(ctrl);
};

const findController = (vid: string, pid: string): BaseController | null => {
  const v = vid.toLowerCase().padStart(4, '0');
  const p = pid.toLowerCase().padStart(4, '0');
  return registry.find(c => c.matches(v, p)) ?? null;
};

const findControllerById = (id: string): BaseController | null => {
  return registry.find(c => c.id === id) ?? null;
};

const getAllControllers = (): readonly BaseController[] => {
  return registry;
};

export {
  findController,
  findControllerById,
  getAllControllers,
  registerController
};
