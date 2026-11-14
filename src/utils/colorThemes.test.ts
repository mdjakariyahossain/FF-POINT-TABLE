import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultDesignConfig,
  deriveSyncedRowGradient,
  extractRowColorsFromImagePixels,
  getContrastTextColor,
  hexToRgba,
  THEME_PRESETS,
} from './colorThemes';

test('default design config matches Classic Pink-Blue preset with black crown and red cup', () => {
  const config = createDefaultDesignConfig();
  assert.equal(config.themeId, 'reference-classic');
  assert.equal(config.crownColor, '#0B0C10');
  assert.equal(config.cupColor, '#DC2626');
  assert.equal(THEME_PRESETS[0].topRankBg, '#090A0D');
});

test('hexToRgba converts 6-digit hex properly', () => {
  assert.equal(hexToRgba('#FF0000', 0.5), 'rgba(255, 0, 0, 0.5)');
});

test('deriveSyncedRowGradient produces high-legibility row gradient stops', () => {
  const synced = deriveSyncedRowGradient('#F6A6FF', '#1442D4');
  assert.match(synced.rowStart, /^#[0-9A-F]{6}$/);
  assert.match(synced.rowEnd, /^#[0-9A-F]{6}$/);
  assert.equal(getContrastTextColor(synced.rowStart, synced.rowEnd), '#0D0E12');
});

test('extractRowColorsFromImagePixels computes light title color on dark backgrounds', () => {
  // 2x2 dark navy image
  const darkPixels = new Uint8ClampedArray([
    10, 15, 40, 255, 20, 25, 60, 255,
    12, 18, 45, 255, 15, 20, 55, 255,
  ]);
  const extracted = extractRowColorsFromImagePixels(darkPixels, 2, 2);
  assert.equal(extracted.titleColor, '#FFFFFF');
});
