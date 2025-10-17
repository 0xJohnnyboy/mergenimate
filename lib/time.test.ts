// This file uses Vitest/Jest syntax. To run, you would need a test runner configured.
// Example: `npm install -D vitest` and run `npx vitest`

import { describe, it, expect } from 'vitest';
import { parseDuration, millisecondsToFriendlyString } from './time';

describe('parseDuration', () => {
  it('should parse seconds correctly', () => {
    expect(parseDuration('30s')).toBe(30000);
    expect(parseDuration('1.5s')).toBe(1500);
  });

  it('should parse minutes correctly', () => {
    expect(parseDuration('2m')).toBe(120000);
  });

  it('should parse hours correctly', () => {
    expect(parseDuration('0.5h')).toBe(1800000);
  });

  it('should parse days correctly', () => {
    expect(parseDuration('1d')).toBe(86400000);
  });

  it('should handle whitespace', () => {
    expect(parseDuration(' 10 s ')).toBe(10000);
  });

  it('should return null for invalid formats', () => {
    expect(parseDuration('10')).toBeNull();
    expect(parseDuration('10 sec')).toBeNull();
    expect(parseDuration('')).toBeNull();
  });
});

describe('millisecondsToFriendlyString', () => {
    it('should format seconds', () => {
        expect(millisecondsToFriendlyString(1500)).toBe('1.5s');
    });
    it('should format minutes', () => {
        expect(millisecondsToFriendlyString(90000)).toBe('1.5m');
    });
    it('should format hours', () => {
        expect(millisecondsToFriendlyString(3600000 * 2.25)).toBe('2.25h');
    });
    it('should format days', () => {
        expect(millisecondsToFriendlyString(86400000 * 3.14)).toBe('3.14d');
    });
});
