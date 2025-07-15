import { IconButton } from '@affine/component';
import { PlayIcon, StopIcon } from '@blocksuite/icons/rc';
import { useCallback, useEffect, useState } from 'react';

import * as styles from './player-wrapper.css';

interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface PodcastData {
  id: string;
  title: string;
  author: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  subtitles: Subtitle[];
}

// Mock data
const mockPodcastData: PodcastData = {
  id: 'podcast-1',
  title: 'Understanding React Hooks',
  author: 'Tech Talks Podcast',
  duration: 1800, // 30 minutes in seconds
  audioUrl: 'https://example.com/podcast.mp3',
  coverUrl:
    'https://www.edigitalagency.com.au/wp-content/uploads/ChatGPT-logo-PNG-large-size-white-green-background.png',
  subtitles: [
    {
      id: '1',
      startTime: 0,
      endTime: 5,
      text: 'Welcome to Tech Talks Podcast.',
    },
    {
      id: '2',
      startTime: 5,
      endTime: 10,
      text: 'Today we will discuss React Hooks in depth.',
    },
    {
      id: '3',
      startTime: 10,
      endTime: 15,
      text: 'Hooks were introduced in React 16.8.',
    },
    {
      id: '4',
      startTime: 15,
      endTime: 20,
      text: 'They allow you to use state without writing a class.',
    },
    {
      id: '5',
      startTime: 20,
      endTime: 25,
      text: "Let's start with the useState hook.",
    },
    {
      id: '6',
      startTime: 25,
      endTime: 30,
      text: 'useState returns a stateful value and a function to update it.',
    },
    {
      id: '7',
      startTime: 30,
      endTime: 35,
      text: 'Here is a simple counter example.',
    },
    {
      id: '8',
      startTime: 35,
      endTime: 40,
      text: 'You can also use multiple state variables.',
    },
  ],
};

export const PlayerWrapper = ({ onLoad }: { onLoad: () => void }) => {
  const [podcast] = useState<PodcastData>(mockPodcastData);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  // Update current subtitle based on playback time
  useEffect(() => {
    const subtitle = podcast.subtitles.find(
      sub => currentTime >= sub.startTime && currentTime < sub.endTime
    );
    setCurrentSubtitle(subtitle || null);
  }, [currentTime, podcast.subtitles]);

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= podcast.duration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, podcast.duration]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      setCurrentTime(newTime);
    },
    []
  );

  const handleSubtitleClick = useCallback((subtitle: Subtitle) => {
    setCurrentTime(subtitle.startTime);
  }, []);

  return (
    <div className={styles.playerWrapper}>
      <div className={styles.playerContainer}>
        <div className={styles.playerHeader}>
          {podcast.coverUrl && (
            <img
              src={podcast.coverUrl}
              alt={podcast.title}
              className={styles.coverImage}
            />
          )}
          <div className={styles.podcastInfo}>
            <h2 className={styles.podcastTitle}>{podcast.title}</h2>
            <p className={styles.podcastAuthor}>{podcast.author}</p>
          </div>
        </div>

        <div className={styles.playerControls}>
          <IconButton
            onClick={togglePlayPause}
            icon={isPlaying ? <StopIcon /> : <PlayIcon />}
            size="large"
          />

          <div className={styles.progressContainer}>
            <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={podcast.duration}
              value={currentTime}
              onChange={handleProgressChange}
              className={styles.progressBar}
            />
            <span className={styles.timeLabel}>
              {formatTime(podcast.duration)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.subtitleContainer}>
        <h3 className={styles.subtitleHeader}>Subtitles</h3>
        <div className={styles.subtitleList}>
          {podcast.subtitles.map(subtitle => (
            <div
              key={subtitle.id}
              className={`${styles.subtitleItem} ${
                currentSubtitle?.id === subtitle.id ? styles.activeSubtitle : ''
              }`}
              onClick={() => handleSubtitleClick(subtitle)}
            >
              <span className={styles.subtitleTime}>
                {formatTime(subtitle.startTime)}
              </span>
              <span className={styles.subtitleText}>{subtitle.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
