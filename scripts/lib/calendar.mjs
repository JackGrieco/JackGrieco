export function summarizeCalendar(calendar) {
  const weeks = calendar.weeks.map((week) => week.contributionDays.map((day) => day.contributionCount));
  const days = weeks.flat();
  return {
    total: calendar.totalContributions,
    activeDays: days.filter((count) => count > 0).length,
    busiestDay: Math.max(0, ...days),
    weeks,
  };
}
