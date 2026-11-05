/* @layer bridge-wasm @kind logic */
import { suppressSink } from './suppress-sink';

const suppressLocationReport = (key: string): void => {
  suppressSink.current?.(key);
};

export { suppressLocationReport };
