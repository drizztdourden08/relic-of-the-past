/* @layer store-site @kind component */
import { Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { HookshopHighlight } from '@rotp/design/packs';
import { Markdown } from '@drizztdourden08/tessera/composites';
import { HIGHLIGHT_PIXEL } from './Welcome.constants';
import type { WelcomeProps } from './Welcome.type';

const Welcome = (props: WelcomeProps) => {
  const { name, message } = props;
  return (
    <Flex as="section" align="center" gap="lg" wrap className="welcome" aria-label="Welcome">
      <HookshopHighlight pixelSize={HIGHLIGHT_PIXEL} className="welcome__highlight" />
      <Stack align="stretch" className="welcome__text">
        <Text as="h2" className="welcome__title">Welcome back, {name}</Text>
        {message.trim() && <Markdown source={message} className="welcome__message" />}
      </Stack>
    </Flex>
  );
};

export { Welcome };
