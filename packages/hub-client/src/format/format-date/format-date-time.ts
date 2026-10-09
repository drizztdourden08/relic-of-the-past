/* @layer site-kit @kind logic */
import { formatDay } from './format-day';
import { padTwoDigits } from './pad-two-digits';

const formatDateTime = (ms: number) => {
  const d = new Date(ms);
  return `${formatDay(ms)} ${padTwoDigits(d.getHours())}:${padTwoDigits(d.getMinutes())}`;
};

export { formatDateTime };
