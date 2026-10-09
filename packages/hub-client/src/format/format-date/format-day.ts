/* @layer site-kit @kind logic */
import { padTwoDigits } from './pad-two-digits';

const formatDay = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${padTwoDigits(d.getMonth() + 1)}-${padTwoDigits(d.getDate())}`;
};

export { formatDay };
