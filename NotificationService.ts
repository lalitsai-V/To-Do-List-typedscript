export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info'
}

export class NotificationService {
  private notificationElement: HTMLElement;
  private timeoutId: number | null = null;

  constructor(elementId: string) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Notification element with id '${elementId}' not found.`);
    }
    this.notificationElement = element;
  }

  public show(message: string, type: NotificationType = NotificationType.SUCCESS, duration: number = 3000): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }

    this.notificationElement.textContent = message;
    this.notificationElement.className = `notification ${type} show`;
    
    this.timeoutId = window.setTimeout(() => {
      this.notificationElement.classList.remove('show');
      this.timeoutId = null;
    }, duration);
  }

  public hide(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.notificationElement.classList.remove('show');
  }
}
