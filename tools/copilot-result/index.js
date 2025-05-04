import { WebClient } from '@slack/web-api';

import { render } from './markdown.js';

const { CHANNEL_ID, SLACK_BOT_TOKEN, COPILOT_RESULT, BRANCH_SHA, BRANCH_NAME } =
  process.env;

const { ok } = await new WebClient(SLACK_BOT_TOKEN).chat.postMessage({
  channel: CHANNEL_ID,
  text: `AFFiNE Copilot Test ${COPILOT_RESULT}`,
  blocks: render(
    `# AFFiNE Copilot Test ${COPILOT_RESULT}

- [${BRANCH_NAME?.replace('refs/heads/', '') || BRANCH_SHA}](https://github.com/toeverything/AFFiNE/commit/${BRANCH_SHA})
`
  ),
});

console.assert(ok, 'Failed to send a message to Slack');
