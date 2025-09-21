"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
class DateUtils {
    static getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    static formatDateForDisplay(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        catch (e) {
            console.error('Error formatting date:', e);
            return dateString;
        }
    }
    static isDatePassed(dateString) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const taskDate = new Date(dateString);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate < today;
        }
        catch (e) {
            console.error('Error comparing dates:', e);
            return false;
        }
    }
}
exports.DateUtils = DateUtils;
//# sourceMappingURL=DateUtils.js.map