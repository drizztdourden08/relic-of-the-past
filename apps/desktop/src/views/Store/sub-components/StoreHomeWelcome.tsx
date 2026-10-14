/* @layer renderer-components @kind component */
import { Button, Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { HookshopHighlight } from '@rotp/design/packs';
import type { StoreHomeWelcomeProps } from '../Store.type';
import { HIGHLIGHT_PIXEL } from '../Store.constants';
import { updatesLine } from '../behavior/updates-line';

const StoreHomeWelcome = (props: StoreHomeWelcomeProps) => {
  const { name, welcome, updateCount, onShowUpdates } = props;

  return (
    <Flex align="center" gap="lg" className="store-home__welcome">
      <HookshopHighlight pixelSize={HIGHLIGHT_PIXEL} className="store-home__highlight" />
      <Stack gap="sm">
        <Text as="h2" className="store__title">Welcome back, {name}</Text>
        {welcome && <Text as="p" className="store__lead">{welcome}</Text>}
        {updateCount > 0 && (
          <Flex>
            <Button variant="secondary" size="sm" onClick={onShowUpdates}>{updatesLine(updateCount)}</Button>
          </Flex>
        )}
      </Stack>
    </Flex>
  );
};

export { StoreHomeWelcome };
