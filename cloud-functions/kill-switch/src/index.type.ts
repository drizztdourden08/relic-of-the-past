/* @layer root-config @kind types */
interface BudgetNotification {
  costAmount?: number;
  budgetAmount?: number;
  alertThresholdExceeded?: number;
}

interface PubsubCloudEvent {
  data?: { message?: { data?: string } };
}

export type { BudgetNotification, PubsubCloudEvent };
