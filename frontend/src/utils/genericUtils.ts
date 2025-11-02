function getCalendarDaysInMonth(year: number, month: number) {
  const monthIndex = month - 1; // 0..11 instead of 1..12
  const names = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
  const date = new Date(year, monthIndex, 1);
  const result = [];
  while (date.getMonth() == monthIndex) {
    result.push(date.getDate() + '-' + names[date.getDay()]);
    date.setDate(date.getDate() + 1);
  }
  return result;
}

export { getCalendarDaysInMonth }