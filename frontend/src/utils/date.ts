export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

  // Ensure start is before end
  if (startDate > endDate) [startDate, endDate] = [endDate, startDate];

  // Iterate from startDate to endDate, counting business days
  let businessDays = 0;
  let current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return businessDays;
}
