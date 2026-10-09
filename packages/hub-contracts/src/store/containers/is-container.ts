/* @layer shared-store @kind logic */
import type { Container } from '../types';
import { CONTAINERS } from './containers.constants';

const isContainer = (value: unknown): value is Container => CONTAINERS.includes(value as Container);

export { isContainer };
