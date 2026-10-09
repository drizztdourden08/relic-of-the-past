/* @layer renderer-app @kind component */
import { useWindowKind } from '@drizztdourden08/brock-react';
import { ViewStorageProvider } from '@drizztdourden08/tessera/data';
import { MainWindowSession } from './sub-components/MainWindowSession';
import { DATA_VIEW_STORAGE } from './GameSession.constants';
import type { GameSessionProps } from './GameSession.type';

const GameSession = (props: GameSessionProps) => {
  const { children } = props;
  const kind = useWindowKind();
  return (
    <ViewStorageProvider value={DATA_VIEW_STORAGE}>
      {kind.kind === 'main' ? <MainWindowSession>{children}</MainWindowSession> : children}
    </ViewStorageProvider>
  );
};

export { GameSession };
