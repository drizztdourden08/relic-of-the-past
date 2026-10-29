/* @layer website-site @kind component */
import { Box, Pressable, Span } from '../../../../design';
import { formatTime } from '../SoundPlayer/behavior/format-time';
import { STEP_LIST_TEXT } from './StepList.constants';
import type { StepListProps } from './StepList.type';
import './StepList.css';

const StepList = ({ steps, current, onSelect }: StepListProps) =>
  steps.length === 0 ? null : (
    <Box as="ol" className="step-list" aria-label={STEP_LIST_TEXT.label}>
      {steps.map((step, index) => (
        <Box as="li" key={step.at} className="step-list__item">
          <Pressable
            className={index === current ? 'step-list__step step-list__step--current' : 'step-list__step'}
            aria-current={index === current ? 'step' : undefined}
            aria-label={STEP_LIST_TEXT.jump(formatTime(step.at), step.label)}
            onClick={() => onSelect(step.at)}
          >
            <Span className="step-list__time">{formatTime(step.at)}</Span>
            <Span className="step-list__label">{step.label}</Span>
          </Pressable>
        </Box>
      ))}
    </Box>
  );

export { StepList };
