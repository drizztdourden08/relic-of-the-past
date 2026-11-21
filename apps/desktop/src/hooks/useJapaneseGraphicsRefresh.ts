/* @layer renderer-lib @kind hook */
import { useEffect } from 'react';
import { refreshJapaneseGraphics } from '../storage/sprites-store';

const useJapaneseGraphicsRefresh = (): void => {
  useEffect(() => {
    void refreshJapaneseGraphics();
  }, []);
};

export { useJapaneseGraphicsRefresh };
