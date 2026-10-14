/* @layer renderer-components @kind component */
import { Flex, Text } from '@drizztdourden08/tessera/primitives';
import type { OriginFactsProps } from '../InstalledOrigin.type';

const OriginFacts = ({ author, semver, license, updateTo }: OriginFactsProps) => (
  <Flex align="center" gap="sm" wrap className="installed-origin__facts">
    <Text as="span">{`by ${author}`}</Text>
    <Text as="span">·</Text>
    <Text as="span">{`v${semver}`}</Text>
    <Text as="span">·</Text>
    <Text as="span">{license}</Text>
    {updateTo !== null && <Text as="span">·</Text>}
    {updateTo !== null && <Text as="span" className="installed-origin__update">{`v${updateTo} available`}</Text>}
  </Flex>
);

export { OriginFacts };
