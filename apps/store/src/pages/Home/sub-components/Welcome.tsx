/* @layer store-site @kind component */
/**
 * The greeting, laid out like the home mockup: the Hookshop highlight on the left (Sentri
 * pulling a shop bag in with its hookshot), then the player's name in the game's face and
 * the welcome message the home page editors wrote.
 */
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { HookshopHighlight } from '@domains/app/compounds/HookshopHighlight';
import { Markdown } from '../../../components/Markdown/Markdown';

/** One CSS pixel per mascot pixel: the picture stands as tall as the mockup's logo. */
const HIGHLIGHT_PIXEL = 1;

type WelcomeProps = {
  name: string;
  /** Markdown; empty shows the greeting alone. */
  message: string;
};

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
export type { WelcomeProps };
