/* @layer root-config @kind logic */
/** POST /reports. Device, session or anonymous; an anonymous caller is
 *  rate-limited by address and must give a contact email, which stays on the
 *  record and never reaches the issue. */
import { SANCTUARY_ROUTES, submitReportSchema } from '../../../../shared/sanctuary';
import { clientIp } from '../http/client-ip';
import { parseBody } from '../http/parse-body';
import { readCaller } from '../auth/require-caller';
import { createReport } from '../reports/create-report';
import type { Route } from '../route.type';

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
