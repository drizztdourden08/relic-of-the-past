/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import { detailsOf, plainTextOf } from '@shared/randomizer/world/option-description';
import type { OptionDescriptionProps } from './OptionDescription.type';

const OptionDescription = (props: OptionDescriptionProps) => {
  const { description, className } = props;
  if (description.length === 0) return null;
  const details = detailsOf(description);

  if (details === undefined) return <Text className={className}>{plainTextOf(description)}</Text>;
  const facts = details.map(({ term, detail }) => ({ label: term, value: detail }));
  return <FactsPanel layout="terms" groups={[facts]} className={className} />;
};

export { OptionDescription };
