import { ExplorerNavigation } from '@affine/core/components/explorer/header/navigation';
import { Header } from '@affine/core/components/pure/header';

export const PodcastsHeader = () => {
  return <Header left={<ExplorerNavigation active={'podcasts'} />} />;
};
