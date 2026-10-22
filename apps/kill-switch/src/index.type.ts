/* @layer root-config @kind types */
interface BudgetNotification {
  costAmount?: number;
  budgetAmount?: number;
  currencyCode?: string;
  alertThresholdExceeded?: number;
}

interface PubsubCloudEvent {
  data?: { message?: { data?: string } };
}

export type { BudgetNotification, PubsubCloudEvent };
