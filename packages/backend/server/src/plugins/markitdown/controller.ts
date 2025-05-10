import { Controller, Get, Options,Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { Public } from '../../core/auth';
import { getCorsHeaders } from '../worker/utils/headers';
import { MarkitdownService } from './service';

@Public()
@Controller('/api/markitdown')
export class MarkitdownController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly markitdownService: MarkitdownService) {}

  @Options('/sse')
  sseOptions(@Req() req: Request, @Res() res: Response) {
    const origin = req.headers.origin;
    return res
      .status(200)
      .header({
        ...getCorsHeaders(origin),
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      })
      .send();
  }

  @Get('/sse')
  async handleSSE(@Req() req: Request, @Res() res: Response) {
    const origin = req.headers.origin;
    console.log('Attempting to connect to markitdown server');

    try {
      const response = await this.markitdownService.getSSEConnection();

      res.set({
        ...getCorsHeaders(origin),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.flushHeaders();

      response.body.on('data', chunk => {
        const data = chunk.toString();
        if (!data.includes('ping')) {
          console.log('Received data:', data);
          res.write(data);
          res.flush();
        }
      });

      req.on('close', () => {
        console.log('Client closed SSE connection');
        res.end();
      });
    } catch (error: any) {
      console.error('Error in /api/markitdown/sse:', error.message);
      res
        .status(500)
        .header(getCorsHeaders(origin))
        .send(`Error connecting to markitdown server: ${error.message}`);
    }
  }

  @Options('/message')
  messageOptions(@Req() req: Request, @Res() res: Response) {
    const origin = req.headers.origin;
    return res
      .status(200)
      .header({
        ...getCorsHeaders(origin),
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      })
      .send();
  }

  @Post(['message', 'messages'])
  async handleMessage(@Req() req: Request, @Res() res: Response) {
    const origin = req.headers.origin;
    try {
      const originalPath = req.originalUrl.replace('/api/markitdown/', '');
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      const data = await this.markitdownService.sendMessage(
        originalPath,
        req.body
      );

      if (data) {
        console.log('Response data:', JSON.stringify(data, null, 2));
        res.header(getCorsHeaders(origin)).json(data);
      } else {
        res.status(202).header(getCorsHeaders(origin)).send();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error proxying message request:', error);
      console.error('Error details:', errorMessage);
      console.error(
        'Error stack:',
        error instanceof Error ? error.stack : 'No stack trace'
      );
      res
        .status(500)
        .header(getCorsHeaders(origin))
        .send(`Error connecting to markitdown server: ${errorMessage}`);
    }
  }
}
