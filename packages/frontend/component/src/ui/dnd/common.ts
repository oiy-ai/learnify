import type { DNDData, fromExternalData } from './types';

export const isExternalDrag = <D extends DNDData>(args: {
  source: { data: D['draggable'] };
}) => {
  return !args.source['data'];
};

export const getAdaptedEventArgs = <
  D extends DNDData,
  Args extends { source: { data: D['draggable'] } },
>(
  args: Args,
  fromExternalData?: fromExternalData<D>,
  isDropEvent = false
): Args => {
  const data =
    isExternalDrag(args) && fromExternalData
      ? fromExternalData(
          // @ts-expect-error hack for external data adapter (source has no data field)
          args as ExternalGetDataFeedbackArgs,
          isDropEvent
        )
      : args.source['data'];

  return {
    ...args,
    source: {
      ...args.source,
      data,
    },
  };
};
