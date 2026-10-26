/* @layer website-site @kind types */
type Feature = {
  id: string;
  title: string;
  body: string;
  media: string | null;
  mediaRatio: string;
  mediaAlt: string;
};

export type { Feature };
