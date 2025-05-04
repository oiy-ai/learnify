export type PageSize = {
  width: number;
  height: number;
};

export type PDFMeta = {
  pageCount: number;
  maxSize: PageSize;
  pageSizes: PageSize[];
};

export type PageSizeOpts = {
  pageNum: number;
};

export type RenderPageOpts = {
  pageNum: number;
  scale?: number;
} & PageSize;

export type RenderedPage = {
  bitmap: ImageBitmap;
};
