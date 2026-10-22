/* @layer root-config @kind logic */
import { cloudEvent } from '@google-cloud/functions-framework';
import { GoogleAuth } from 'google-auth-library';
import type { BudgetNotification, PubsubCloudEvent } from './index.type';

const decodeMessage = (event: PubsubCloudEvent): BudgetNotification => {
  const raw = event.data?.message?.data;
  if (!raw) return {};
  return JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as BudgetNotification;
};

const unlinkBilling = async (): Promise<void> => {
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const hostProjectId = await auth.getProjectId();
  const response = await fetch(
    `https://cloudbilling.googleapis.com/v1/projects/${hostProjectId}/billingInfo`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingAccountName: '' }),
    },
  );
  if (!response.ok) {
    throw new Error(`billing unlink failed ${response.status}: ${await response.text()}`);
  }
};

cloudEvent('killSwitch', async (event: unknown) => {
  const notification = decodeMessage(event as PubsubCloudEvent);
  process.stdout.write(
    `budget notification: cost=${notification.costAmount ?? 0} ` +
      `budget=${notification.budgetAmount ?? 0} currency=${notification.currencyCode ?? 'unknown'}\n`,
  );
  if ((notification.costAmount ?? 0) > 0) {
    await unlinkBilling();
  }
});
