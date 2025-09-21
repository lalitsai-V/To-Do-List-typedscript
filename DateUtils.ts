export class DateUtils {
  public static getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  public static formatDateForDisplay(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }

  public static isDatePassed(dateString: string): boolean {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const taskDate = new Date(dateString);
      taskDate.setHours(0, 0, 0, 0);
      
      return taskDate < today;
    } catch (e) {
      console.error('Error comparing dates:', e);
      return false;
    }
  }
}
