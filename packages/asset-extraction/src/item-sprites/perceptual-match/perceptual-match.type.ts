/* @layer shared-asset-extraction @kind types */
import type { Oklab } from '../../graphics/oklab';

interface Entry { index: number; lab: Oklab }
interface Entries { neutral: Entry[]; chromatic: Entry[] }
interface Tone { key: number; lab: Oklab; count: number }

export type { Entries, Entry, Tone };
