/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';

const IntroStep = () => {
  const t = useT();
  return (
    <>
      <Text as="p">
        {t('views-input-tester:intro.walkthrough')}
      </Text>
      <Text as="p">
        {t('views-input-tester:intro.contents')}
      </Text>
    </>
  );
};

export { IntroStep };
