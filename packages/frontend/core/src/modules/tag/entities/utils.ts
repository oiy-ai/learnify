import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';

const tagToPaletteLineMap: Record<string, string> = {
  [cssVar('tagRed')]: cssVar('paletteLineRed'),
  [cssVar('tagTeal')]: cssVar('paletteLineTeal'),
  [cssVar('tagBlue')]: cssVar('paletteLineBlue'),
  [cssVar('tagYellow')]: cssVar('paletteLineYellow'),
  [cssVar('tagPink')]: cssVar('paletteLineMagenta'),
  [cssVar('tagWhite')]: cssVar('paletteLineWhite'),
  [cssVar('tagGray')]: cssVar('paletteLineGrey'),
  [cssVar('tagOrange')]: cssVar('paletteLineOrange'),
  [cssVar('tagPurple')]: cssVar('paletteLinePurple'),
  [cssVar('tagGreen')]: cssVar('paletteLineGreen'),
};

// map var(--affine-tag-xxx) colors to var(--affine-chip-label-xxx)
const tagToChipColorMap: Record<string, string> = {
  [cssVar('tagRed')]: cssVarV2('chip/label/red'),
  [cssVar('tagTeal')]: cssVarV2('chip/label/teal'),
  [cssVar('tagBlue')]: cssVarV2('chip/label/blue'),
  [cssVar('tagYellow')]: cssVarV2('chip/label/yellow'),
  [cssVar('tagPink')]: cssVarV2('chip/label/magenta'),
  [cssVar('tagWhite')]: cssVarV2('chip/label/white'),
  [cssVar('tagGray')]: cssVarV2('chip/label/grey'),
  [cssVar('tagOrange')]: cssVarV2('chip/label/orange'),
  [cssVar('tagPurple')]: cssVarV2('chip/label/purple'),
  [cssVar('tagGreen')]: cssVarV2('chip/label/green'),
};

const chipToTagColorMap: Record<string, string> = Object.fromEntries(
  Object.entries(tagToChipColorMap).map(([key, value]) => [value, key])
);

const chipToPaletteLineMap: Record<string, string> = Object.fromEntries(
  Object.entries(chipToTagColorMap).map(([chip, tag]) => [
    chip,
    tagToPaletteLineMap[tag],
  ])
);

const paletteLineToChipMap: Record<string, string> = Object.fromEntries(
  Object.entries(chipToPaletteLineMap).map(([chip, paletteLine]) => [
    paletteLine,
    chip,
  ])
);

// hack: map var(--affine-tag-xxx)/var(--affine-chip-label-xxx) colors to var(--affine-palette-line-xxx)
export const databaseTagColorToAffineLabel = (color: string) => {
  return chipToPaletteLineMap[color] || tagToPaletteLineMap[color] || color;
};

export const databaseTagColorToV2 = (color: string) => {
  return tagToChipColorMap[color] || color;
};

export const affineLabelToDatabaseTagColor = (color: string) => {
  return paletteLineToChipMap[color] || color;
};
