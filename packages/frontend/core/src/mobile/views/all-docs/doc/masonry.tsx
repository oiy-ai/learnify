import { Masonry } from '@affine/component';
import type { DocMeta } from '@blocksuite/affine/store';
import { useMemo } from 'react';

import { calcRowsById, DocCard } from '../../../components';

const fullStyle = {
  width: '100%',
  height: '100%',
};

export const MasonryDocs = ({
  items,
  showTags,
}: {
  items: DocMeta[];
  showTags?: boolean;
}) => {
  const masonryItems = useMemo(
    () =>
      items.map(item => {
        return {
          id: item.id,
          height: calcRowsById(item.id) * 18 + 95,
          children: (
            <DocCard style={fullStyle} meta={item} showTags={showTags} />
          ),
        };
      }),
    [items, showTags]
  );
  return (
    <Masonry
      style={fullStyle}
      itemWidthMin={160}
      gapX={17}
      gapY={10}
      paddingX={16}
      paddingY={16}
      virtualScroll
      items={masonryItems}
    />
  );
};
