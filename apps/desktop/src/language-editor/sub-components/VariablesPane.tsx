/* @layer renderer-components @kind component */
import { VariablesTable } from '@rotp/design/packs';
import { UnbuiltPane } from './UnbuiltPane';
import type { VariablesPaneProps } from './VariablesPane.type';

const VariablesPane = (props: VariablesPaneProps) => {
  const { variables, tab, readOnly, setVariableValue, upsertGlossaryTerm, removeGlossaryTerm } = props;
  return (
    <UnbuiltPane>
      <VariablesTable
        variables={variables}
        rows={tab.rows}
        used={tab.used}
        filter={tab.filter}
        query={tab.query}
        onFilterChange={tab.setFilter}
        onQueryChange={tab.setQuery}
        onChangeValue={readOnly ? undefined : setVariableValue}
        onAddTerm={readOnly ? undefined : upsertGlossaryTerm}
        onRemoveTerm={readOnly ? undefined : removeGlossaryTerm}
        onFindHardcoded={readOnly ? undefined : tab.openScan}
      />
    </UnbuiltPane>
  );
};

export { VariablesPane };
