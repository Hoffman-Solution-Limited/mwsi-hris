export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

  // Ensure start is before end
  if (startDate > endDate) [startDate, endDate] = [endDate, startDate];

  // Total difference in days
  const diffMs = endDate.getTime() - startDate.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day

  let businessDays = 0;

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);

    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }

  return businessDays;
}
