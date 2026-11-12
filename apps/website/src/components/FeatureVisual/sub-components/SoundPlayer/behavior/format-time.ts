/* @layer website-site @kind logic */
import { SECONDS_PER_MINUTE } from '../SoundPlayer.constants';

const formatTime = (seconds: number): string => {
  const whole = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const rest = String(whole % SECONDS_PER_MINUTE).padStart(2, '0');
  return `${Math.floor(whole / SECONDS_PER_MINUTE)}:${rest}`;
};

export { formatTime };
