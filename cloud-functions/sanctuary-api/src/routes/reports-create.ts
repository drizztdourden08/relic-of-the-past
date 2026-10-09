/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES, submitReportSchema } from '@rotp/hub-contracts';
import { clientIp } from '@rotp/hub-server';
import { parseBody } from '@rotp/hub-server';
import { readCaller } from '@rotp/hub-server';
import { createReport } from '../reports/create-report';
import type { Route } from '@rotp/hub-server';

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
