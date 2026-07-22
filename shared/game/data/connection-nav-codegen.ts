/* @layer shared-game @kind data */
/**
 * Serializes ConnectionNavData into a compact TypeScript object literal for
 * insertion into connection data files. The output is a valid `nav:` value for
 * a ScreenConnection — arrays inline, numbers decimal, fields omitted when
 * absent so the emitted literal stays minimal.
 */

import type { ConnectionNavData, ConnectionPointData, RequirementSet } from '../navigation/nav-data.types';

const numArray = (a: readonly number[]): string => `[${a.join(', ')}]`;

const requirementSet = (r: RequirementSet): string => {
  const groups = r.map(group => `[${group.map(req => `'${req}'`).join(', ')}]`);
  return `[${groups.join(', ')}]`;
};

const connectionPoint = (p: ConnectionPointData): string => {
  const parts: string[] = [`id: '${p.id}'`];
  if (p.direction) parts.push(`direction: '${p.direction}'`);
  parts.push(`tiles: ${numArray(p.tiles)}`);
  parts.push(`requirements: ${requirementSet(p.requirements)}`);
  if (p.position) parts.push(`position: { row: ${p.position.row}, col: ${p.position.col} }`);
  if (p.entranceIndex != null) parts.push(`entranceIndex: ${p.entranceIndex}`);
  parts.push(`oneWay: ${p.oneWay === null ? 'null' : `'${p.oneWay}'`}`);
  return `{ ${parts.join(', ')} }`;
};

const serializeConnectionNav = (nav: ConnectionNavData): string => {
  const parts: string[] = [`transitType: '${nav.transitType}'`];
  parts.push(`requirements: ${requirementSet(nav.requirements)}`);
  parts.push(`bidirectional: ${nav.bidirectional}`);
  if (nav.fromPoint) parts.push(`fromPoint: ${connectionPoint(nav.fromPoint)}`);
  if (nav.toPoint) parts.push(`toPoint: ${connectionPoint(nav.toPoint)}`);
  if (nav.overlapTiles) parts.push(`overlapTiles: ${numArray(nav.overlapTiles)}`);
  parts.push(`weight: ${nav.weight}`);
  if (nav.validAfter) parts.push(`validAfter: '${nav.validAfter}'`);
  if (nav.invalid) parts.push(`invalid: true`);
  return `{ ${parts.join(', ')} }`;
};

export { serializeConnectionNav };
