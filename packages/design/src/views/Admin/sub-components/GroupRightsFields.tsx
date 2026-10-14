/* @layer site-kit @kind component */
import { Fragment } from 'react';
import { Text } from '@drizztdourden08/tessera/primitives';
import type { GroupRightsFieldsProps } from './GroupRightsFields.type';

const GroupRightsFields = (props: GroupRightsFieldsProps) => {
  const { rightsEditors, rights, onChange } = props;
  const titled = rightsEditors.length > 1;

  return (
    <>
      {rightsEditors.map(({ model, Editor }) => (
        <Fragment key={model.site}>
          {titled && <Text as="span" variant="caption" className="group-editor__title">{model.site}</Text>}
          <Editor value={rights[model.site] ?? []} onChange={(next) => onChange(model.site, next)} />
        </Fragment>
      ))}
    </>
  );
};

export { GroupRightsFields };
