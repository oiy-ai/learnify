import { TextSelection } from '@blocksuite/affine/std';

import { handleInlineAskAIAction } from '../../actions/doc-handler';
import { AIProvider } from '../../provider';
import type { AffineAIPanelWidget } from '../../widgets/ai-panel/ai-panel';

export function setupSpaceAIEntry(panel: AffineAIPanelWidget) {
  // Background: The keydown event triggered by a space may originate from:
  // 1. Normal space insertion
  // 2. Space triggered by input method confirming candidate words
  // In scenarios like (2), some browsers (see [ISSUE](https://github.com/toeverything/AFFiNE/issues/11541))
  // and input method callbacks produce events identical to scenario (1),
  // making it impossible to distinguish between the two.
  //
  // To fix this, the space-activated AI listener uses the `keypress` event:
  // In scenario 2, `event.which !== 32` (may be `30430` or other values) can be used to differentiate from scenario 1.
  panel.handleEvent('keyPress', ctx => {
    const host = panel.host;
    const keyboardState = ctx.get('keyboardState');
    const event = keyboardState.raw;
    if (
      AIProvider.actions.chat &&
      event.key === ' ' &&
      event.which === 32 &&
      !event.isComposing
    ) {
      const selection = host.selection.find(TextSelection);
      if (selection && selection.isCollapsed() && selection.from.index === 0) {
        const block = host.view.getBlock(selection.blockId);
        if (
          !block?.model?.text ||
          block.model.text?.length > 0 ||
          block.model.flavour !== 'affine:paragraph'
        )
          return;

        event.preventDefault();
        handleInlineAskAIAction(host);
      }
    }
  });
}
