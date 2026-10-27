/* @layer website-site @kind types */
type Screenshot = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  pending?: true;
};

export type { Screenshot };
