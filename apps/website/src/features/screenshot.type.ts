/* @layer website-site @kind types */
type ShotId =
  | 'sh-01' | 'sh-02' | 'sh-03' | 'sh-04'
  | 'sh-05' | 'sh-06' | 'sh-07' | 'sh-08'
  | 'sh-09' | 'sh-10' | 'sh-11' | 'sh-12'
  | 'sh-13' | 'sh-14' | 'sh-15' | 'sh-16';

type Screenshot = {
  id: ShotId;
  src: string;
  width: number;
  height: number;
  alt: string;
  pending?: boolean;
};

export type { Screenshot, ShotId };
