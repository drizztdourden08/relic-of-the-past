/* @layer renderer-components @kind component */
/**
 * A setting's own words, in whichever shape the catalog wrote them: one
 * sentence, or a list of lines each opening with the term it is about. The
 * branch lives here alone, so a plain option row, a capacity family and the
 * wishing pond all present a description identically. A catalog entry with
 * nothing to say (an empty sentence, an empty list) renders nothing at all,
 * so the row above it closes up instead of keeping a blank line.
 */
import { Text, TermList } from '@ds/primitives';
import { detailsOf, plainTextOf } from '@shared/randomizer/ap-world/option-description';
import type { OptionDescriptionProps } from './OptionDescription.type';

const OptionDescription = (props: OptionDescriptionProps) => {
  const { description, className } = props;
  if (description.length === 0) return null;
  const details = detailsOf(description);

  if (details === undefined) return <Text className={className}>{plainTextOf(description)}</Text>;
  return <TermList items={details} className={className} />;
};

export { OptionDescription };
