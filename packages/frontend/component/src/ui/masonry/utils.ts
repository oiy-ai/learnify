import type { MasonryItem, MasonryItemXYWH } from './type';

export const calcColumns = (
  totalWidth: number,
  itemWidth: number | 'stretch',
  itemWidthMin: number,
  gapX: number,
  paddingX: number
) => {
  const availableWidth = totalWidth - paddingX * 2;

  if (itemWidth === 'stretch') {
    let columns = 1;
    while (columns * itemWidthMin + (columns - 1) * gapX < availableWidth) {
      columns++;
    }
    const finalColumns = columns - 1;
    const finalWidth =
      (availableWidth - (finalColumns - 1) * gapX) / finalColumns;
    return {
      columns: finalColumns,
      width: finalWidth,
    };
  } else {
    let columns = 1;
    while (columns * itemWidth + (columns - 1) * gapX < availableWidth) {
      columns++;
    }
    return {
      columns: columns - 1,
      width: itemWidth,
    };
  }
};

export const calcLayout = (
  items: MasonryItem[],
  options: {
    columns: number;
    width: number;
    gapX: number;
    gapY: number;
    paddingX: number;
    paddingY: number;
  }
) => {
  const { columns, width, gapX, gapY, paddingX, paddingY } = options;

  const layoutMap = new Map<MasonryItem['id'], MasonryItemXYWH>();
  const heightStack = Array.from({ length: columns }, () => paddingY);

  items.forEach(item => {
    const minHeight = Math.min(...heightStack);
    const minHeightIndex = heightStack.indexOf(minHeight);
    const x = minHeightIndex * (width + gapX) + paddingX;
    const y = minHeight + gapY;
    heightStack[minHeightIndex] = y + item.height;
    layoutMap.set(item.id, { x, y, w: width, h: item.height });
  });

  const finalHeight = Math.max(...heightStack) + paddingY;

  return { layout: layoutMap, height: finalHeight };
};

export const calcSleep = (options: {
  viewportHeight: number;
  scrollY: number;
  layoutMap: Map<MasonryItem['id'], MasonryItemXYWH>;
  preloadHeight: number;
}) => {
  const { viewportHeight, scrollY, layoutMap, preloadHeight } = options;

  const sleepMap = new Map<MasonryItem['id'], boolean>();

  layoutMap.forEach((layout, id) => {
    const { y, h } = layout;

    const isInView =
      y + h + preloadHeight > scrollY &&
      y - preloadHeight < scrollY + viewportHeight;

    sleepMap.set(id, !isInView);
  });

  return sleepMap;
};
