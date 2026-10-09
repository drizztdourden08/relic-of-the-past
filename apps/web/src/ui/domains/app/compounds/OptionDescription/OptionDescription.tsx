/* @layer renderer-components @kind component */
import { Text, TermList } from '@ds/primitives';
import { detailsOf, plainTextOf } from '@shared/randomizer/world/option-description';
import type { OptionDescriptionProps } from './OptionDescription.type';

const OptionDescription = (props: OptionDescriptionProps) => {
  const { description, className } = props;
  if (description.length === 0) return null;
  const details = detailsOf(description);

  if (details === undefined) return <Text className={className}>{plainTextOf(description)}</Text>;
  return <TermList items={details} className={className} />;
};

export { OptionDescription };
