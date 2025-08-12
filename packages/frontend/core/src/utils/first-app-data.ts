// the following import is used to ensure the block suite editor effects are run
import '../blocksuite/block-suite-editor';

import { DebugLogger } from '@affine/debug';
import { DEFAULT_WORKSPACE_NAME } from '@affine/env/constant';
import onboardingUrl from '@affine/templates/onboarding.zip';
import { NoteDisplayMode } from '@blocksuite/affine/model';
import { Text } from '@blocksuite/affine/store';
import { ZipTransformer } from '@blocksuite/affine/widgets/linked-doc';

import { LEARNIFY_COLLECTIONS } from '../constants/learnify-collections';
import { LEARNIFY_DOCUMENTS } from '../constants/learnify-documents';
import { CollectionService } from '../modules/collection';
import { DocsService } from '../modules/doc';
import {
  getAFFiNEWorkspaceSchema,
  type WorkspacesService,
} from '../modules/workspace';

export async function buildShowcaseWorkspace(
  workspacesService: WorkspacesService,
  flavour: string,
  workspaceName: string
) {
  const meta = await workspacesService.create(flavour, async docCollection => {
    docCollection.meta.initialize();
    docCollection.doc.getMap('meta').set('name', workspaceName);
    const blob = await (await fetch(onboardingUrl)).blob();

    await ZipTransformer.importDocs(
      docCollection,
      getAFFiNEWorkspaceSchema(),
      blob
    );
  });

  const { workspace, dispose } = workspacesService.open({ metadata: meta });

  await workspace.engine.doc.waitForDocReady(workspace.id);

  const docsService = workspace.scope.get(DocsService);

  // Find the new Learnify documents
  const getStartedDoc = docsService.list.docs$.value.find(
    p => p.title$.value === 'Get Started'
  );
  const podcastSampleDoc = docsService.list.docs$.value.find(
    p => p.title$.value === 'Podcast Sample'
  );

  // create default collection for learnify
  const collectionService = workspace.scope.get(CollectionService);
  collectionService.createCollection({
    id: LEARNIFY_COLLECTIONS.MIND_MAPS,
    name: 'Learnify Mind Maps',
    rules: { filters: [] },
    allowList: [],
  });
  collectionService.createCollection({
    id: LEARNIFY_COLLECTIONS.NOTES,
    name: 'Learnify Notes',
    rules: { filters: [] },
    allowList: getStartedDoc ? [getStartedDoc.id] : [],
  });
  collectionService.createCollection({
    id: LEARNIFY_COLLECTIONS.PODCASTS,
    name: 'Learnify Podcasts',
    rules: { filters: [] },
    allowList: podcastSampleDoc ? [podcastSampleDoc.id] : [],
  });
  collectionService.createCollection({
    id: LEARNIFY_COLLECTIONS.FLASHCARDS,
    name: 'Learnify Flashcards',
    rules: { filters: [] },
    allowList: [],
  });

  // create materials document for learnify
  const materialsDoc = docsService.createDoc({
    id: LEARNIFY_DOCUMENTS.MATERIALS,
    docProps: {
      page: { title: new Text('Learnify Materials') },
      note: { displayMode: NoteDisplayMode.DocOnly },
      paragraph: {
        text: new Text(
          'This document contains all uploaded materials for Learnify.'
        ),
      },
    },
  });
  materialsDoc.setProperty('isLearnifyMaterials', true);

  dispose();

  return { meta, defaultDocId: getStartedDoc?.id };
}

const logger = new DebugLogger('createFirstAppData');

export async function createFirstAppData(workspacesService: WorkspacesService) {
  if (localStorage.getItem('is-first-open') !== null) {
    return;
  }
  localStorage.setItem('is-first-open', 'false');
  const { meta, defaultDocId } = await buildShowcaseWorkspace(
    workspacesService,
    'local',
    DEFAULT_WORKSPACE_NAME
  );
  logger.info('create first workspace', defaultDocId);
  return { meta, defaultPageId: defaultDocId };
}
