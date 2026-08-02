/* @layer renderer-components @kind barrel */
export { RecordEditor } from './RecordEditor';
export { EditorGroup } from './sub-components/EditorGroup';
export { ReferencedBy } from './sub-components/ReferencedBy';
export { changedPaths, hasPathChanged } from './behavior/dirty-paths';
export { layoutGroups } from './behavior/layout-groups';
export { detectUnionBranch } from './behavior/union-branch';
export { IDENTITY_PATH, isIdentityField } from './behavior/identity-field';
export { blankValue, elementFields, rebaseField } from './behavior/array-elements';
export { isReferencedTagList, isTagsField } from './behavior/tag-field';
export { buildTagKeyMap } from './behavior/tag-key-map';
export { positionPairOf } from './behavior/position-shape';
export type {
  EditorBinding, EditorGroupModel, NumberBoundsResolver, PositionPair, RecordEditorProps, ReferencedByHit,
  TagCreateResult, TagCreator, TagSuggestionResolver,
} from './RecordEditor.type';
export type { ReferencedByProps } from './sub-components/ReferencedBy';
export type { TagKeyMap } from './behavior/tag-key-map';
export type { IdRefOption, IdRefOptionResolver, NumberBounds } from '../field-kits/registry';
export type { UnionBranch, UnionBranchStatus } from './behavior/union-branch';
