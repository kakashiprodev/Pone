/**
 * This service will help with helpers and utilities for colors
 */

// base color: #00ae97
const colorPalette = [
  '#001512',
  '#002a24',
  '#003f37',
  '#005549',
  '#006a5c',
  '#007f6e',
  '#009481',
  '#00aa93',
  '#00bfa5',
  '#00d4b8',
  '#00e9ca',
  '#00ffdd',
  '#15fee0',
  '#2affe2',
  '#3fffe5',
  '#55fee8',
  '#6affeb',
  '#7fffee',
  '#94fef0',
  '#a9fff3',
  '#bffff6',
  '#d4fef9',
  '#e9fffc',
];

/**
 * Get a color from the palette
 */
export const getMonochromeColorPalette = (count: number): string[] => {
  let pointer = 5;
  const result = [];
  for (let i = 0; i < count; i++) {
    if (pointer === colorPalette.length - 1) {
      pointer = 0;
    }
    result.push(colorPalette[pointer]);
    pointer++;
  }
  return result;
};
