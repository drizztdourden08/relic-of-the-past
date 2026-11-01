/* @layer website-site @kind types */
type AnchorPillItem = {
  id: string;
  label: string;
};

type AnchorPillsProps = {
  items: readonly AnchorPillItem[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  className?: string;
  wrap?: boolean;
};

export type { AnchorPillItem, AnchorPillsProps };
