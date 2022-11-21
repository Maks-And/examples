export type DateNameFormat = "full" | "3-chars" | "1-char";

// Day related ↓
export type DayType = {
  dayOfWeek: WeekNames;
  weekDayIndex: number; // 0 - 6, where 0 is Sunday
  dayOfMonth: number; // 1-(31|30|29|28)
  month: MonthNames;
  monthIndex: number; // 0 - 11, where 0 is January
  date: Date;
};
// Day related ↑

// Week related ↓
export enum WeeksEnumeration {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

export enum Weeks {
  Sunday = "Sunday",
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
}

export type WeekNames = keyof typeof Weeks;

export type WeekNameFormat = DateNameFormat;

export type WeekType = {
  weekOfYear: number;
  relatedYear: number;
  startDayOfWeek: Date;
  endDateOfWeek: Date;
  days: DayType[];
};
// Week related ↑

// Month related ↓
export enum MonthsEnumeration {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December,
}

export enum Months {
  January = "January",
  February = "February",
  March = "March",
  April = "April",
  May = "May",
  June = "June",
  July = "July",
  August = "August",
  September = "September",
  October = "October",
  November = "November",
  December = "December",
}

export type MonthNames = keyof typeof Months;

export type MonthNameFormat = DateNameFormat;

export type MonthType = {
  monthIndex: number; // 0 - 11, where 0 is January
  year: number;
  monthName: MonthNames;
  weeks: WeekType[];
  days: DayType[];
};
// Month related ↑

// Misc
export enum DateMeasureEnumeration {
  millisecond,
  second,
  minute,
  hour,
  day,
  week,
  fMonth,
  fLeapMonth,
  month30,
  month31,
  year,
  yearLeap,
}

export enum DateMeasure {
  millisecond = 1,
  second = 1e3,
  minute = 6e4,
  hour = 3.6e6,
  day = 8.64e7,
  week = 6.048e8,
  fMonth = 2.4192e9, // f - February
  fLeapMonth = 2.5056e9,
  month30 = 2.592e9,
  month31 = 2.6784e9,
  year = 3.1536e10,
  yearLeap = 3.16224e10,
}

export type DateMeasureKeys = keyof typeof DateMeasure;

export type DateArgType = Date | number | string;

export type DateArgArrType = [
  year: number,
  month: number,
  day?: number,
  hour?: number,
  minute?: number,
  second?: number,
  millisecond?: number,
];

export type DateArgument = DateArgType | DateArgArrType;
