/* @layer website-site @kind component */
import type { AudioProps } from './Audio.type';

const Audio = ({ preload = 'none', ...rest }: AudioProps) => <audio preload={preload} {...rest} />;

export { Audio };
