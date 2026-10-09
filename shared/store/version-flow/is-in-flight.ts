/* @layer shared-store @kind logic */
import { IN_FLIGHT } from './version-flow.constants';
import type { FlowVersion } from './version-flow.type';

const isInFlight = (version: FlowVersion): boolean =>
  IN_FLIGHT.includes(version.review.state) && !version.removed;

export { isInFlight };
