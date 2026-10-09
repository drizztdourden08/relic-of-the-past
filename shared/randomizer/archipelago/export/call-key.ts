/* @layer shared-game @kind logic */
import type { HelperNode } from './export.type';

const callKey = (node: HelperNode): string => `${node.name}${JSON.stringify(node.args ?? [])}`;

export { callKey };
