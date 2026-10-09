/* @layer renderer-components @kind types */
interface CellRef { column: number; row: number }

interface CellBounds { c0: number; c1: number; r0: number; r1: number }

interface Occupant { id: string; column: number; row: number; colSpan: number; rowSpan: number }

export type { CellBounds, CellRef, Occupant };
