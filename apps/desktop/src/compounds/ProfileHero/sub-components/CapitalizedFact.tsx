/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';

const CapitalizedFact = ({ value }: { value: string }) => <Text as="span" className="profile-hero__capitalize">{value}</Text>;

export { CapitalizedFact };
