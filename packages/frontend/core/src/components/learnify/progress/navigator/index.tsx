import { MenuLinkItem } from '@affine/core/modules/app-sidebar/views';
import {
  HistoryIcon,
  MindmapIcon,
  TextIcon,
  ViewLayersIcon,
} from '@blocksuite/icons/rc';
import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { useLearnifyTheme } from '../../../../theme/learnify';
import * as styles from './index.css';

const getColor = (
  percent: number,
  theme: ReturnType<typeof useLearnifyTheme>
) => {
  if (percent > 67) {
    return theme.successColor;
  }
  if (percent < 33) {
    return theme.successColor2;
  }
  return theme.successColor1;
};

const percent1 = 65;
const percent2 = 32;
const percent3 = 88;
const percent4 = 72;

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
              backgroundColor: color ?? cssVarV2('button/primary'),
            }}
          />
        </div>
      )}
    </div>
  );
};

export const ProgressNavigator = () => {
  const theme = useLearnifyTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const color1 = getColor(percent1, theme);
  const color2 = getColor(percent2, theme);
  const color3 = getColor(percent3, theme);
  const color4 = getColor(percent4, theme);

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
          <Progress
            name="Overall Progress"
            percent={overallPercent}
            color={cssVar('processingColor')}
          />
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
