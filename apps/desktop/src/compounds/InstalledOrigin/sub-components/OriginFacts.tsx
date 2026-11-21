/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Flex, Text } from '@drizztdourden08/tessera/primitives';
import type { OriginFactsProps } from '../InstalledOrigin.type';

const OriginFacts = ({ author, semver, license, updateTo }: OriginFactsProps) => {
  const t = useT();

  return (
    <Flex align="center" gap="sm" wrap className="installed-origin__facts">
      <Text as="span">{t('compounds:installed-origin.by', { author })}</Text>
      <Text as="span">·</Text>
      <Text as="span">{t('compounds:installed-origin.version', { semver })}</Text>
      <Text as="span">·</Text>
      <Text as="span">{license}</Text>
      {updateTo !== null && <Text as="span">·</Text>}
      {updateTo !== null && <Text as="span" className="installed-origin__update">{t('compounds:installed-origin.update-available', { version: updateTo })}</Text>}
    </Flex>
  );
};

export { OriginFacts };
