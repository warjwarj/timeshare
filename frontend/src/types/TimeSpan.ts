export const TimeSpan = {
  Hour: 'Hour',
  Day: 'Day',
  Week: 'Week',
  Month: 'Month',
}
export type TimeSpan = typeof TimeSpan[keyof typeof TimeSpan];