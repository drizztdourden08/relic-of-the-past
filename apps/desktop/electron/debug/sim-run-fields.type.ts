/* @layer electron-main @kind types */
import type { SimRunConfig } from '@rotp/navigation';

type FieldParser = (config: SimRunConfig, value: string) => void;

export type { FieldParser };
