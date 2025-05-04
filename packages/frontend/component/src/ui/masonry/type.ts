export interface MasonryItem extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  height: number;
}

export interface MasonryItemXYWH {
  x: number;
  y: number;
  w: number;
  h: number;
}
