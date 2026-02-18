/**
 * Converts a Gregorian date string (YYYY/MM or YYYY) to Japanese era format (和暦).
 * Dates are stored as Gregorian; wareki is computed on display only.
 *
 * Era boundaries:
 *   令和: 2019-05-01 onwards
 *   平成: 1989-01-08 to 2019-04-30
 *   昭和: 1926-12-25 to 1989-01-07
 */
export function toWareki(gregorianDate: string | null | undefined): string {
  if (!gregorianDate) return '';

  const parts = gregorianDate.split('/');
  const year = parseInt(parts[0], 10);
  const month = parts[1] ? parseInt(parts[1], 10) : 1;

  if (isNaN(year)) return gregorianDate;

  const date = new Date(year, month - 1, 1);

  try {
    const formatted = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {
      era: 'long',
      year: 'numeric',
      month: 'numeric',
    }).format(date);

    // Replace "1年" with "元年" for first year of each era (gannen convention)
    const gannenFixed = formatted.replace(/(\p{Script=Han}+)1年/u, '$1元年');

    if (!parts[1]) {
      return gannenFixed.replace(/\d+月$/, '').trim();
    }

    return gannenFixed;
  } catch {
    return gregorianDate;
  }
}
