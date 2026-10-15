/* @layer shared-hub @kind types */
import type { UploadedPart } from '../uploaded-part.type';

type SignedParts = { urls: { part: number; url: string }[] };

type BegunMultipart<R> = {
  partSize: number;
  parts: number;
  sign: (parts: number[], partsDone: number) => Promise<SignedParts>;
  complete: (etags: string[]) => Promise<R>;
  abort: () => Promise<unknown>;
  listParts: () => Promise<UploadedPart[]>;
};

type Sliceable<P> = { size: number; slice: (start: number, end: number) => P };

type PutPart<P> = (url: string, part: P, onProgress: (loaded: number) => void) => Promise<string>;

type RunMultipartParams<P, R> = {
  source: Sliceable<P>;
  begun: BegunMultipart<R>;
  done: Map<number, string>;
  put: PutPart<P>;
  onProgress: (sent: number) => void;
  onPartsUp?: () => void;
  signal?: AbortSignal;
};

export type { SignedParts, BegunMultipart, RunMultipartParams };
