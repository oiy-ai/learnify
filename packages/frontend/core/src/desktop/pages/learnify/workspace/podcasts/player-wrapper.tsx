import { Button, IconButton } from '@affine/component';
import { HeadphonePanelIcon, PlayIcon, StopIcon } from '@blocksuite/icons/rc';
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
  duration: 100, // 100 seconds to match subtitle length
  audioUrl: 'https://example.com/podcast.mp3',
  coverUrl:
    'https://www.edigitalagency.com.au/wp-content/uploads/ChatGPT-logo-PNG-large-size-white-green-background.png',
  subtitles: [
    {
      id: '1',
      startTime: 0,
      endTime: 5,
      text: 'Welcome to our amazing Tech Talks Podcast episode today.',
    },
    {
      id: '2',
      startTime: 5,
      endTime: 10,
      text: 'Today we will thoroughly discuss React Hooks concepts in great depth and detail.',
    },
    {
      id: '3',
      startTime: 10,
      endTime: 15,
      text: 'React Hooks were first introduced in the React version 16.8 release.',
    },
    {
      id: '4',
      startTime: 15,
      endTime: 20,
      text: 'They allow you to easily use state and lifecycle methods without writing a complex class component.',
    },
    {
      id: '5',
      startTime: 20,
      endTime: 25,
      text: "Let's start exploring the powerful and popular useState hook functionality.",
    },
    {
      id: '6',
      startTime: 25,
      endTime: 30,
      text: 'The useState hook returns a stateful value and a setter function to update that specific state value.',
    },
    {
      id: '7',
      startTime: 30,
      endTime: 35,
      text: 'Here is a simple and practical counter example to demonstrate this concept.',
    },
    {
      id: '8',
      startTime: 35,
      endTime: 40,
      text: 'You can also easily use multiple independent state variables within a single component.',
    },
    {
      id: '9',
      startTime: 40,
      endTime: 45,
      text: 'Another important hook is useEffect which handles side effects and lifecycle events.',
    },
    {
      id: '10',
      startTime: 45,
      endTime: 50,
      text: 'useEffect can replace componentDidMount, componentDidUpdate, and componentWillUnmount methods from class components.',
    },
    {
      id: '11',
      startTime: 50,
      endTime: 55,
      text: 'The dependency array in useEffect controls when the effect should run and update.',
    },
    {
      id: '12',
      startTime: 55,
      endTime: 60,
      text: 'Custom hooks allow you to extract and reuse stateful logic between different components.',
    },
    {
      id: '13',
      startTime: 60,
      endTime: 65,
      text: 'useContext hook provides a way to pass data through component trees without prop drilling.',
    },
    {
      id: '14',
      startTime: 65,
      endTime: 70,
      text: 'useReducer is perfect for managing complex state logic that involves multiple sub-values.',
    },
    {
      id: '15',
      startTime: 70,
      endTime: 75,
      text: 'useMemo and useCallback help optimize performance by memoizing expensive calculations and functions.',
    },
    {
      id: '16',
      startTime: 75,
      endTime: 80,
      text: 'useRef provides a way to access DOM elements directly and persist values across renders.',
    },
    {
      id: '17',
      startTime: 80,
      endTime: 85,
      text: 'Rules of hooks ensure that hooks are always called in the same order on every render.',
    },
    {
      id: '18',
      startTime: 85,
      endTime: 90,
      text: 'Never call hooks inside loops, conditions, or nested functions to maintain consistency.',
    },
    {
      id: '19',
      startTime: 90,
      endTime: 95,
      text: 'Building custom hooks follows the same rules and allows for better code organization and reusability.',
    },
    {
      id: '20',
      startTime: 95,
      endTime: 100,
      text: 'Thank you for listening to this comprehensive introduction to React Hooks. Happy coding!',
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
            size={32}
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

      <Button
        className={styles.connectButton}
        size="large"
        onClick={() => {
          console.log('连线当前播客');
          // TODO: Implement connect functionality
        }}
        prefix={<HeadphonePanelIcon />}
      >
        连线当前播客
      </Button>

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
