import { ResizePanel } from '../resize-panel/resize-panel';
import { Masonry } from './masonry';

export default {
  title: 'UI/Masonry',
};

const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 10,
        border: `1px solid rgba(100, 100, 100, 0.2)`,
        boxShadow: '0 1px 10px rgba(0, 0, 0, 0.1)',
        padding: 10,
        backgroundColor: 'white',
      }}
    >
      {children}
    </div>
  );
};

const basicCards = Array.from({ length: 10000 }, (_, i) => {
  return {
    id: 'card-' + i,
    height: Math.round(100 + Math.random() * 100),
    children: (
      <Card>
        <h1>Hello</h1>
        <p>World</p>
        {i}
      </Card>
    ),
  };
});

export const BasicVirtualScroll = () => {
  return (
    <ResizePanel width={800} height={600}>
      <Masonry
        gapX={10}
        gapY={10}
        style={{ width: '100%', height: '100%' }}
        paddingX={12}
        paddingY={12}
        virtualScroll
        items={basicCards}
      />
    </ResizePanel>
  );
};

const transitionCards = Array.from({ length: 10000 }, (_, i) => {
  return {
    id: 'card-' + i,
    height: Math.round(100 + Math.random() * 100),
    children: <Card>{i}</Card>,
    style: { transition: 'transform 0.2s ease' },
  };
});

export const CustomTransition = () => {
  return (
    <ResizePanel width={800} height={600}>
      <Masonry
        gapX={10}
        gapY={10}
        style={{ width: '100%', height: '100%' }}
        paddingX={12}
        paddingY={12}
        virtualScroll
        items={transitionCards}
        locateMode="transform3d"
      />
    </ResizePanel>
  );
};
