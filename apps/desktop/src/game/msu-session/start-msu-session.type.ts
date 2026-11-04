/* @layer bridge-wasm @kind types */
import type { MsuSessionOptions } from '@rotp/msu';

type StartOptions = Omit<MsuSessionOptions, 'config' | 'host' | 'log'>;

export type { StartOptions };
