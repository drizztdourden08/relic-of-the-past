/* @layer store-site @kind types */
type PictureSpec = { width: number; height: number; bytes: number };

type Picture = { blob: Blob; width: number; height: number };

export type { PictureSpec, Picture };
