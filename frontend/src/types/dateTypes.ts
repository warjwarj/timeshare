export const WeekDayEnum = {
  Sunday: "Sunday",
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
} as const;
export type WeekDay = typeof WeekDayEnum[keyof typeof WeekDayEnum]

export const MonthEnum = {
  January: "January",
  February: "February",
  March: "March",
  April: "April",
  May: "May",
  June: "June",
  July: "July",
  August: "August",
  September: "September",
  October: "October",
  November: "November",
  December: "December",
} as const;
export type Month = typeof MonthEnum[keyof typeof MonthEnum]

export const TimeSpanEnum = {
  Mins5: 'Mins5',
  Mins10: 'Mins10',
  Mins15: 'Mins15',
  Mins30: 'Mins30',
  Hour: 'Hour',
  Day: 'Day',
  Week: 'Week',
  Month: 'Month',
}
export type TimeSpan = typeof TimeSpanEnum[keyof typeof TimeSpanEnum];