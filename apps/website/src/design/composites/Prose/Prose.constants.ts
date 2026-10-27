/* @layer website-site @kind constants */
const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const LIST_PATTERN = /^[-*]\s+(.*)$/;
const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
const COMMENT_PATTERN = /^<!--.*-->$/;

const INLINE_PATTERN =
  /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

export { COMMENT_PATTERN, HEADING_PATTERN, HEADING_TAGS, INLINE_PATTERN, LIST_PATTERN };
