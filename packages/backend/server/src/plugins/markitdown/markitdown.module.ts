import { Module } from '@nestjs/common';

import { MarkitdownController } from './controller';
import { MarkitdownService } from './service';

@Module({
  controllers: [MarkitdownController],
  providers: [MarkitdownService],
})
export class MarkitdownModule {}
