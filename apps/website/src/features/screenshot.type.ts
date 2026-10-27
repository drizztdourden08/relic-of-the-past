/* @layer website-site @kind types */
type ShotId =
  | 'v-01' | 'v-02' | 'v-03' | 'v-03-anim' | 'v-04' | 'v-05-lens' | 'v-06' | 'v-06-lens' | 'v-07' | 'v-08' | 'v-09'
  | 'v-10' | 'v-11' | 'v-12' | 'v-13' | 'v-14a' | 'v-14b' | 'v-14c' | 'v-15' | 'v-16' | 'v-16b'
  | 'v-17' | 'v-18' | 'v-18a' | 'v-18b' | 'v-19' | 'v-20' | 'v-21' | 'v-22' | 'v-23' | 'v-24'
  | 'v-25' | 'v-26' | 'v-27' | 'v-28' | 'v-29';

type Screenshot = {
  id: ShotId;
  src: string;
  width: number;
  height: number;
  alt: string;
  animated?: true;
  pending?: true;
};

export type { Screenshot };
