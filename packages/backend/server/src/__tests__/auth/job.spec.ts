import { ScheduleModule } from '@nestjs/schedule';
import { TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import test from 'ava';

import { AuthModule, AuthService } from '../../core/auth';
import { AuthCronJob } from '../../core/auth/job';
import { createTestingModule } from '../utils';

let m: TestingModule;
let db: PrismaClient;

test.before(async () => {
  m = await createTestingModule({
    imports: [ScheduleModule.forRoot(), AuthModule],
  });

  db = m.get(PrismaClient);
});

test.after.always(async () => {
  await m.close();
});

test('should clean expired user sessions', async t => {
  const auth = m.get(AuthService);
  const job = m.get(AuthCronJob);
  const user1 = await auth.signUp('u1@affine.pro', '1');
  const user2 = await auth.signUp('u2@affine.pro', '1');
  await auth.createUserSession(user1.id);
  await auth.createUserSession(user2.id);
  let userSessions = await db.userSession.findMany();
  t.is(userSessions.length, 2);

  // no expired sessions
  await job.cleanExpiredUserSessions();
  userSessions = await db.userSession.findMany();
  t.is(userSessions.length, 2);

  // clean all expired sessions
  await db.userSession.updateMany({
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  await job.cleanExpiredUserSessions();
  userSessions = await db.userSession.findMany();
  t.is(userSessions.length, 0);
});
