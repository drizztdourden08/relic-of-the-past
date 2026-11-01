/* @layer website-site @kind component */
import { AnchorPills, Box } from '../../design';
import { chapterItemsOf } from './behavior/chapter-items-of';
import { useStuckBar } from './behavior/useStuckBar';
import { CHAPTER_BAR_TEXT } from './ChapterBar.constants';
import type { ChapterBarProps } from './ChapterBar.type';
import './ChapterBar.css';

const ChapterBar = ({ groups, activeGroupId, onSelect }: ChapterBarProps) => {
  const barRef = useStuckBar();

  return (
    <Box ref={barRef} className="chapter-bar">
      <AnchorPills
        items={chapterItemsOf(groups)}
        activeId={activeGroupId ?? ''}
        onSelect={onSelect}
        ariaLabel={CHAPTER_BAR_TEXT.label}
        wrap
      />
      <Box className="chapter-bar__progress" aria-hidden="true" />
    </Box>
  );
};

export { ChapterBar };
