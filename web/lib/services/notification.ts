// Notification Service - centralized notification logic

interface TransactionNotificationData {
  transactionId: string;
  amount?: number;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

export class NotificationService {
  static async sendNotification(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    phoneNumber: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: string
  ) {
    // Implementation will be added here
    throw new Error("Not implemented");
  }

  static async sendTransactionNotification(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    phoneNumber: string,
    status: string,
    data: TransactionNotificationData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message?: string
  ) {
    // Implementation will be added here
    console.log(
      `Transaction notification for ${phoneNumber}: ${data.transactionId} - ${status}`
    );
    // For now, just log the notification
    return Promise.resolve();
  }

  static async createNotificationTemplate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    templateName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    content: string
  ) {
    // Implementation will be added here
    throw new Error("Not implemented");
  }

  static async queueNotification(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    phoneNumber: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: string
  ) {
    // Implementation will be added here
    throw new Error("Not implemented");
  }
}
