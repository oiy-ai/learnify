import { ExplorerNavigation } from '@affine/core/components/explorer/header/navigation';
import { Header } from '@affine/core/components/pure/header';

export const MindMapsHeader = () => {
  return <Header left={<ExplorerNavigation active={'mind-maps'} />} />;
};
