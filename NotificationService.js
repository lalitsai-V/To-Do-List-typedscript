"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["SUCCESS"] = "success";
    NotificationType["ERROR"] = "error";
    NotificationType["INFO"] = "info";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class NotificationService {
    constructor(elementId) {
        this.timeoutId = null;
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Notification element with id '${elementId}' not found.`);
        }
        this.notificationElement = element;
    }
    show(message, type = NotificationType.SUCCESS, duration = 3000) {
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
    hide() {
        if (this.timeoutId) {
            window.clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.notificationElement.classList.remove('show');
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map