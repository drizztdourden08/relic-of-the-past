/* @layer store-site @kind component */
/**
 * The greeting with the player's name and the welcome message the home page editors wrote,
 * with the Hookshop highlight beside them: the mascot pulling a shop bag in with its hookshot.
 */
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { HookshopHighlight } from '@domains/app/compounds/HookshopHighlight';
import { Markdown } from '../../../components/Markdown/Markdown';
import { useHighlightScale } from '../behavior/useHighlightScale';

type WelcomeProps = {
  name: string;
  /** Markdown; empty shows the greeting alone. */
  message: string;
};

const Welcome = (props: WelcomeProps) => {
  const { name, message } = props;
  const pixelSize = useHighlightScale();
  return (
    <Flex as="section" align="center" gap="lg" className="welcome" aria-label="Welcome">
      <Stack gap="xs" align="stretch" className="welcome__text">
        <Text as="h2" variant="title" className="welcome__title">Welcome back, {name}</Text>
        {message.trim() && <Markdown source={message} />}
      </Stack>
      <HookshopHighlight pixelSize={pixelSize} className="welcome__highlight" />
    </Flex>
  );
};

export { Welcome };
export type { WelcomeProps };
