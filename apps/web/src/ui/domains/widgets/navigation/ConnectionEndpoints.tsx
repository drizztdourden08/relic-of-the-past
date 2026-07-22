/* @layer renderer-widgets @kind component */
/**
 * Renders a connection's from → to endpoints with each screen's display name
 * prominent and the raw id code secondary. An unknown id (not in the dataset)
 * shows the code alone with a warning marker.
 */

import { Text } from '../../../design-system/primitives';
import { endpointLabel } from './connection-endpoint-label';

interface EndpointProps {
  id: string;
}

interface ConnectionEndpointsProps {
  from: string;
  to: string;
}

const Endpoint = (props: EndpointProps) => {
  const { id } = props;
  const { name, code, known } = endpointLabel(id);
  return (
    <Text as="span" className={`conn-editor__ep ${known ? '' : 'conn-editor__ep--unknown'}`}>
      {name && <Text as="span" className="conn-editor__ep-name">{name}</Text>}
      <Text as="span" className="conn-editor__ep-code">{name ? code : `${code} ⚠`}</Text>
    </Text>
  );
};

const ConnectionEndpoints = (props: ConnectionEndpointsProps) => {
  const { from, to } = props;
  return (
    <Text as="span" className="conn-editor__ep-pair">
      <Endpoint id={from} />
      <Text as="span" className="conn-editor__ep-arrow">→</Text>
      <Endpoint id={to} />
    </Text>
  );
};

export { ConnectionEndpoints };
