/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES, submitReportSchema } from '../../../../shared/sanctuary';
import { clientIp } from '../../../hub-core/http/client-ip';
import { parseBody } from '../../../hub-core/http/parse-body';
import { readCaller } from '../../../hub-core/auth/require-caller';
import { createReport } from '../reports/create-report';
import type { Route } from '../../../hub-core/route.type';

const reportsCreate: Route = {
  ...SANCTUARY_ROUTES.reportsCreate,
  handler: async ({ req, res }) => {
    const caller = await readCaller(req);
    const body = parseBody(submitReportSchema, req.body);
    const result = await createReport(caller, clientIp(req), body);
    res.status(201).json(result);
  },
};

export { reportsCreate };
