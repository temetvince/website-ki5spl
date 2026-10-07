/**
 * Drops trailing zeros from a fixed-point decimal string, and the point itself
 * when nothing follows it, so `'14.1000'` reads `'14.1'` and `'472.0'` reads
 * `'472'`.
 */
function trimZeros(text: string): string {
  return text.includes('.') ? text.replace(/\.?0+$/u, '') : text;
}

/**
 * Formats a frequency in the unit a ham reads it in: kHz below 1 MHz, MHz
 * below 10 GHz, and GHz above. The split at 10 GHz matches the ARRL chart,
 * which lists 23 cm as `1240–1300 MHz` and 3 cm as `10.0–10.5 GHz`. MHz values
 * keep at least three decimals, so a band edge prints as `14.100 MHz` rather
 * than `14.1 MHz`, and up to four, so a 100 Hz dial such as `1.8366 MHz` is
 * not rounded away.
 *
 * @param khz - A non-negative frequency in kHz with at most 100 Hz precision.
 */
export function formatFrequency(khz: number): string {
  if (khz < 1000) {
    return `${trimZeros(khz.toFixed(1))} kHz`;
  }
  if (khz < 10_000_000) {
    const trimmed = trimZeros((khz / 1000).toFixed(4));
    const [whole, fraction = ''] = trimmed.split('.');
    return `${whole}.${fraction.padEnd(3, '0')} MHz`;
  }
  return `${trimZeros((khz / 1_000_000).toFixed(3))} GHz`;
}

/**
 * Formats a range as one frequency when its edges coincide, as
 * `14.025–14.070 MHz` when both edges share a unit, as two full frequencies
 * when they do not, and as `275 GHz and above` when there is no upper edge.
 *
 * @param startKhz - Lower edge, in kHz.
 * @param endKhz - Upper edge, in kHz, or `null` for an open-ended range.
 */
export function formatRange(startKhz: number, endKhz: number | null): string {
  if (endKhz === null) {
    return `${formatFrequency(startKhz)} and above`;
  }
  if (endKhz === startKhz) {
    return formatFrequency(startKhz);
  }
  const start = formatFrequency(startKhz);
  const end = formatFrequency(endKhz);
  const unit = end.slice(end.lastIndexOf(' '));
  return start.endsWith(unit) ?
      `${start.slice(0, -unit.length)}–${end}`
    : `${start}–${end}`;
}
