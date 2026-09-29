const MONTH_NUMBERS: Readonly<Record<string, number>> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

const MONTH_PATTERN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sept', 'Sep',
  'Oct', 'Nov', 'Dec',
].join('|');

const MONTH_DAY_YEAR = new RegExp(
  `\\b(${MONTH_PATTERN})\\s+(0?[1-9]|[12]\\d|3[01])(?:st|nd|rd|th)?[,]?\\s+(\\d{4})\\b`,
  'gi',
);
const DAY_MONTH_YEAR = new RegExp(
  `\\b(0?[1-9]|[12]\\d|3[01])(?:st|nd|rd|th)?\\s+(${MONTH_PATTERN})[,]?\\s+(\\d{4})\\b`,
  'gi',
);

function koreanDate(year: string, monthName: string, day: string): string {
  const month = MONTH_NUMBERS[monthName.toLowerCase()];
  return `${year}년 ${month}월 ${Number(day)}일`;
}

/** Localizes complete English calendar dates without touching surrounding text. */
export function localizeEnglishDateText(value: string): string | undefined {
  let changed = false;
  let localized = value.replace(
    MONTH_DAY_YEAR,
    (_match, month: string, day: string, year: string) => {
      changed = true;
      return koreanDate(year, month, day);
    },
  );
  localized = localized.replace(
    DAY_MONTH_YEAR,
    (_match, day: string, month: string, year: string) => {
      changed = true;
      return koreanDate(year, month, day);
    },
  );
  return changed ? localized : undefined;
}
