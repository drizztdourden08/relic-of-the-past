/* @layer shared-game @kind logic */
import { EU_CAPACITY, US_CAPACITY } from './letter-table.constants';

const letterCapacity = (eu: boolean): number => (eu ? EU_CAPACITY : US_CAPACITY);

export { letterCapacity };
