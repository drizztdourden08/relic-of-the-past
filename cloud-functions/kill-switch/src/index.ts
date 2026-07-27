/* @layer root-config @kind logic */
import { cloudEvent } from '@google-cloud/functions-framework';
import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = 'rotp-bugreports';

interface BudgetNotification {
  costAmount?: number;
  budgetAmount?: number;
  alertThresholdExceeded?: number;
}

interface PubsubCloudEvent {
  data?: { message?: { data?: string } };
}

const decodeMessage = (event: PubsubCloudEvent): BudgetNotification => {
  const raw = event.data?.message?.data;
  if (!raw) return {};
  return JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as BudgetNotification;
};

const unlinkBilling = async (): Promise<void> => {
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  await fetch(`https://cloudbilling.googleapis.com/v1/projects/${PROJECT_ID}/billingInfo`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ billingAccountName: '' }),
  });
};

cloudEvent('killSwitch', async (event: unknown) => {
  const notification = decodeMessage(event as PubsubCloudEvent);
  if ((notification.costAmount ?? 0) > 0) {
    await unlinkBilling();
  }
});
