import { MenuLinkItem } from '@affine/core/modules/app-sidebar/views';
import {
  HistoryIcon,
  MindmapIcon,
  TextIcon,
  ViewLayersIcon,
} from '@blocksuite/icons/rc';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import rainbowProgressImage from '../../assets/rainbow-progress.png';
import * as styles from './index.css';

const getColor = (percent: number, theme: string | undefined) => {
  let r, g, b;

  if (theme === 'dark') {
    // cmyk(92,0,34) 76 -> 37
    // 5,61,40 -> 13, 161, 107
    r = Math.round(5 + percent * 0.09);
    g = Math.round(61 + percent * 1.01);
    b = Math.round(40 + percent * 0.67);
  } else {
    // cmyk(92,0,34) 66 -> 10
    // 7, 87, 57 -> 18, 230, 151
    r = Math.round(7 + percent * 0.11);
    g = Math.round(87 + percent * 1.43);
    b = Math.round(57 + percent * 0.94);
  }
  return `rgb(${r}, ${g}, ${b})`;
};

const percent1 = Math.floor(Math.random() * 33) + 33;
const percent2 = Math.floor(Math.random() * 30) + 70;
const percent3 = Math.floor(Math.random() * 30) + 3;
const percent4 = 100;

const Progress = ({
  name,
  percent,
  color,
  children,
}: {
  name: ReactNode;
  percent?: number;
  color?: string | null;
  children?: React.ReactNode;
}) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    if (percent === undefined) return;

    const duration = 600; // 1 second
    const startTime = performance.now();
    const startValue = 0;
    const endValue = percent;

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const currentValue = startValue + (endValue - startValue) * progress;
      setAnimatedPercent(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [percent]);

  return (
    <div className={styles.progressRoot}>
      <div className={styles.progressInfoRow}>
        <span className={styles.progressName}>{name}</span>
        <span
          className={styles.progressDesc}
        >{`${animatedPercent} / 100 %`}</span>
      </div>
      {children ?? (
        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{
              width: `${animatedPercent}%`,
              ...(color
                ? { backgroundColor: color }
                : {
                    backgroundImage: `url(${rainbowProgressImage})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                  }),
            }}
          />
        </div>
      )}
    </div>
  );
};

export const ProgressNavigator = () => {
  const { resolvedTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const color1 = getColor(percent1, resolvedTheme);
  const color2 = getColor(percent2, resolvedTheme);
  const color3 = getColor(percent3, resolvedTheme);
  const color4 = getColor(percent4, resolvedTheme);

  const overallPercent = Math.round(
    (percent1 + percent2 + percent3 + percent4) / 4
  );

  return (
    <div className={styles.root}>
      <MenuLinkItem
        to="/all"
        icon={isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.progressItem}>
          <Progress name="Overall Progress" percent={overallPercent} />
        </div>
      </MenuLinkItem>
      {isExpanded && (
        <>
          <MenuLinkItem to="/all" icon={<MindmapIcon />}>
            <div className={styles.progressItem}>
              <Progress name="Mind Map" percent={percent1} color={color1} />
            </div>
          </MenuLinkItem>
          <MenuLinkItem to="/all" icon={<ViewLayersIcon />}>
            <div className={styles.progressItem}>
              <Progress name="Q&A Cards" percent={percent2} color={color2} />
            </div>
          </MenuLinkItem>
          <MenuLinkItem to="/all" icon={<TextIcon />}>
            <div className={styles.progressItem}>
              <Progress name="Flashcards" percent={percent3} color={color3} />
            </div>
          </MenuLinkItem>
          <MenuLinkItem to="/all" icon={<HistoryIcon />}>
            <div className={styles.progressItem}>
              <Progress name="Podcast" percent={percent4} color={color4} />
            </div>
          </MenuLinkItem>
        </>
      )}
    </div>
  );
};
