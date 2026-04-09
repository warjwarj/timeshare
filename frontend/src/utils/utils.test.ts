import { describe, it, expect } from 'vitest';
import { TZDate } from '@date-fns/tz';
import {
  definitelyUtcButNaiveIsoStrToTzDate,
  naiveIsoStrToTzDate,
  tzdateToWallClockInDatesTimezone,
  tzdateToWallClockTimeInAnotherTimezone,
  tzdateToUtcString,
  tzdateToTzdate,
} from './utils';

describe('naiveIsoStrToTzDate', () => {
  it('treats the naive string as UTC and converts to the target timezone', () => {
    // '14:30' is treated as 14:30 UTC; April in London is BST (UTC+1) so wall clock = 15:30
    const result = definitelyUtcButNaiveIsoStrToTzDate('2026-04-09T14:30:00', 'Europe/London');
    expect(result).toBeInstanceOf(TZDate);
    expect(result.timeZone).toBe('Europe/London');
    expect(result.getHours()).toBe(15);
    expect(result.getMinutes()).toBe(30);
  });

  it('UTC target timezone shows the same time as the naive string', () => {
    const result = definitelyUtcButNaiveIsoStrToTzDate('2026-01-15T09:00:00', 'UTC');
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });

  it('applies the correct offset for non-European timezones', () => {
    // '18:00' as UTC; July in New York is EDT (UTC-4) so wall clock = 14:00
    const result = definitelyUtcButNaiveIsoStrToTzDate('2026-07-04T18:00:00', 'America/New_York');
    expect(result.timeZone).toBe('America/New_York');
    expect(result.getHours()).toBe(14);
  });

  it('preserves the date components when offset does not cross a day boundary', () => {
    // December in London is GMT (UTC+0) so no offset
    const result = definitelyUtcButNaiveIsoStrToTzDate('2026-12-25T00:00:00', 'Europe/London');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(11); // 0-indexed
    expect(result.getDate()).toBe(25);
  });

  it('crosses a day boundary when the offset pushes past midnight', () => {
    // '02:00' as UTC; New York in January is EST (UTC-5) so wall clock = 21:00 previous day
    const result = definitelyUtcButNaiveIsoStrToTzDate('2026-01-15T02:00:00', 'America/New_York');
    expect(result.getDate()).toBe(14);
    expect(result.getHours()).toBe(21);
  });
});

describe('naiveIsoStrToTzDate', () => {
  it('treats the naive string as wall-clock time in the target timezone', () => {
    // '09:29' should be interpreted as 09:29 in Tahiti (UTC-10), not browser local time
    const result = naiveIsoStrToTzDate('2026-04-06T09:29:00', 'Pacific/Tahiti');
    expect(result).toBeInstanceOf(TZDate);
    expect(result.timeZone).toBe('Pacific/Tahiti');
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(29);
    expect(result.getDate()).toBe(6);
  });

  it('preserves wall-clock time for positive-offset timezones', () => {
    // April in London is BST (UTC+1); 14:30 wall clock should stay 14:30
    const result = naiveIsoStrToTzDate('2026-04-09T14:30:00', 'Europe/London');
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('preserves wall-clock time for UTC', () => {
    const result = naiveIsoStrToTzDate('2026-01-15T09:00:00', 'UTC');
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });

  it('preserves wall-clock time for large negative offsets', () => {
    // Samoa is UTC-11
    const result = naiveIsoStrToTzDate('2026-06-15T22:00:00', 'Pacific/Samoa');
    expect(result.getHours()).toBe(22);
    expect(result.getDate()).toBe(15);
  });

  it('preserves wall-clock time for large positive offsets', () => {
    // Auckland in April is NZST (UTC+12)
    const result = naiveIsoStrToTzDate('2026-04-09T03:00:00', 'Pacific/Auckland');
    expect(result.getHours()).toBe(3);
    expect(result.getDate()).toBe(9);
  });

  it('round-trips correctly: naive -> TZDate -> wall clock string', () => {
    const naive = '2026-04-06T09:29';
    const tz = 'Pacific/Tahiti';
    const tzDate = naiveIsoStrToTzDate(naive + ':00', tz);
    const backToNaive = tzdateToWallClockInDatesTimezone(tzDate);
    expect(backToNaive).toBe(naive);
  });
});

describe('tzdateToUtc', () => {
  it('converts a Tahiti time to UTC', () => {
    // 09:29 in Tahiti (UTC-10) = 19:29 UTC
    const tzDate = new TZDate(2026, 3, 6, 9, 29, 0, 0, 'Pacific/Tahiti');
    const utc = tzdateToUtcString(tzDate);
    expect(utc).toBe('2026-04-06T19:29:00.000Z');
  });

  it('converts a BST time to UTC', () => {
    // 14:30 BST (UTC+1) = 13:30 UTC
    const tzDate = new TZDate(2026, 3, 9, 14, 30, 0, 0, 'Europe/London');
    const utc = tzdateToUtcString(tzDate);
    expect(utc).toBe('2026-04-09T13:30:00.000Z');
  });

  it('UTC time stays the same', () => {
    const tzDate = new TZDate(2026, 0, 15, 9, 0, 0, 0, 'UTC');
    const utc = tzdateToUtcString(tzDate);
    expect(utc).toBe('2026-01-15T09:00:00.000Z');
  });
});

describe('tzdateToWallClockTimeInDatesTimezone', () => {
  it('returns a naive ISO string in the dates own timezone', () => {
    const tzDate = new TZDate(2026, 3, 9, 14, 30, 0, 0, 'Pacific/Samoa');
    const result = tzdateToWallClockInDatesTimezone(tzDate);
    expect(result).toBe('2026-04-09T14:30');
  });

  it('returns wall clock time, not UTC', () => {
    // April in London is BST (UTC+1), so 14:30 BST != 13:30 UTC
    const bstDate = new TZDate(2026, 3, 9, 14, 30, 0, 0, 'Europe/London');
    const result = tzdateToWallClockInDatesTimezone(bstDate);
    expect(result).toBe('2026-04-09T14:30');
  });

  it('works with UTC timezone', () => {
    const utcDate = new TZDate(2026, 0, 15, 9, 0, 0, 0, 'UTC');
    const result = tzdateToWallClockInDatesTimezone(utcDate);
    expect(result).toBe('2026-01-15T09:00');
  });

  it('handles midnight correctly', () => {
    const midnight = new TZDate(2026, 5, 1, 0, 0, 0, 0, 'Europe/London');
    const result = tzdateToWallClockInDatesTimezone(midnight);
    expect(result).toBe('2026-06-01T00:00');
  });
});

describe('tzdateToWallClockTimeInAnotherTimezone', () => {
  it('returns the same time when converting to the same timezone', () => {
    const tzDate = new TZDate(2026, 3, 9, 14, 30, 0, 0, 'Europe/London');
    const result = tzdateToWallClockTimeInAnotherTimezone(tzDate, 'Europe/London');
    expect(result).toBe('2026-04-09T14:30');
  });

  it('converts BST to UTC (one hour behind)', () => {
    // 14:30 BST (UTC+1) = 13:30 UTC
    const bstDate = new TZDate(2026, 3, 9, 14, 30, 0, 0, 'Europe/London');
    const result = tzdateToWallClockTimeInAnotherTimezone(bstDate, 'UTC');
    expect(result).toBe('2026-04-09T13:30');
  });

  it('converts BST to EDT', () => {
    // 14:30 BST (UTC+1) = 09:30 EDT (UTC-4)
    const bstDate = new TZDate(2026, 3, 9, 14, 30, 0, 0, 'Europe/London');
    const result = tzdateToWallClockTimeInAnotherTimezone(bstDate, 'America/New_York');
    expect(result).toBe('2026-04-09T09:30');
  });

  it('handles date boundary crossings', () => {
    // 01:00 BST (UTC+1) = 00:00 UTC = previous day 20:00 EDT (UTC-4)
    const earlyMorning = new TZDate(2026, 3, 9, 1, 0, 0, 0, 'Europe/London');
    const result = tzdateToWallClockTimeInAnotherTimezone(earlyMorning, 'America/New_York');
    expect(result).toBe('2026-04-08T20:00');
  });

  it('converts to a timezone ahead of the source', () => {
    // 10:00 BST (UTC+1) = 09:00 UTC = 17:00 SGT (UTC+8)
    const londonDate = new TZDate(2026, 3, 9, 10, 0, 0, 0, 'Europe/London');
    const result = tzdateToWallClockTimeInAnotherTimezone(londonDate, 'Asia/Singapore');
    expect(result).toBe('2026-04-09T17:00');
  });
});

describe('tzdateToTzdate', () => {
  it('converts a Tahiti TZDate to London TZDate representing the same instant', () => {
    // 09:29 in Tahiti (UTC-10) = 20:29 BST (UTC+1) same day
    const tahiti = new TZDate(2026, 3, 6, 9, 29, 0, 0, 'Pacific/Tahiti');
    const london = tzdateToTzdate(tahiti, 'Europe/London');
    expect(london).toBeInstanceOf(TZDate);
    expect(london.timeZone).toBe('Europe/London');
    expect(london.getHours()).toBe(20);
    expect(london.getMinutes()).toBe(29);
    expect(london.getDate()).toBe(6);
  });

  it('preserves the same instant (identical getTime)', () => {
    const tahiti = new TZDate(2026, 3, 6, 9, 29, 0, 0, 'Pacific/Tahiti');
    const london = tzdateToTzdate(tahiti, 'Europe/London');
    expect(london.getTime()).toBe(tahiti.getTime());
  });

  it('converts to the same timezone (no-op)', () => {
    const original = new TZDate(2026, 3, 9, 14, 30, 0, 0, 'Europe/London');
    const same = tzdateToTzdate(original, 'Europe/London');
    expect(same.getHours()).toBe(14);
    expect(same.getMinutes()).toBe(30);
  });

  it('handles date boundary crossings', () => {
    // 01:00 BST (UTC+1) = 00:00 UTC -> in Tahiti (UTC-10) = 14:00 previous day
    const london = new TZDate(2026, 3, 9, 1, 0, 0, 0, 'Europe/London');
    const tahiti = tzdateToTzdate(london, 'Pacific/Tahiti');
    expect(tahiti.getDate()).toBe(8);
    expect(tahiti.getHours()).toBe(14);
  });

  it('converts UTC to a positive-offset timezone', () => {
    // 09:00 UTC = 17:00 SGT (UTC+8)
    const utc = new TZDate(2026, 3, 9, 9, 0, 0, 0, 'UTC');
    const singapore = tzdateToTzdate(utc, 'Asia/Singapore');
    expect(singapore.getHours()).toBe(17);
    expect(singapore.getDate()).toBe(9);
  });
});
