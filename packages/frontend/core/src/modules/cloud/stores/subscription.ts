import type {
  CreateCheckoutSessionInput,
  SubscriptionRecurring,
} from '@affine/graphql';
import {
  cancelSubscriptionMutation,
  createCheckoutSessionMutation,
  getWorkspaceSubscriptionQuery,
  pricesQuery,
  resumeSubscriptionMutation,
  SubscriptionPlan,
  subscriptionQuery,
  updateSubscriptionMutation,
} from '@affine/graphql';
import { Store } from '@toeverything/infra';

import type { GlobalCache } from '../../storage';
import type { UrlService } from '../../url';
import type { SubscriptionType } from '../entities/subscription';
import type { GraphQLService } from '../services/graphql';
import type { ServerService } from '../services/server';
const SUBSCRIPTION_CACHE_KEY = 'subscription:';

const getDefaultSubscriptionSuccessCallbackLink = (
  baseUrl: string,
  plan?: SubscriptionPlan | null,
  scheme?: string
) => {
  const path =
    plan === SubscriptionPlan.Team
      ? '/upgrade-success/team'
      : plan === SubscriptionPlan.AI
        ? '/ai-upgrade-success'
        : '/upgrade-success';
  const urlString = baseUrl + path;
  const url = new URL(urlString);
  if (scheme) {
    url.searchParams.set('scheme', scheme);
  }
  return url.toString();
};

export class SubscriptionStore extends Store {
  constructor(
    private readonly gqlService: GraphQLService,
    private readonly globalCache: GlobalCache,
    private readonly urlService: UrlService,
    private readonly serverService: ServerService
  ) {
    super();
  }

  async fetchSubscriptions(abortSignal?: AbortSignal) {
    const data = await this.gqlService.gql({
      query: subscriptionQuery,
      context: {
        signal: abortSignal,
      },
    });

    if (!data.currentUser) {
      throw new Error('No logged in');
    }

    return {
      userId: data.currentUser?.id,
      subscriptions: data.currentUser?.subscriptions,
    };
  }

  async fetchWorkspaceSubscriptions(
    workspaceId: string,
    abortSignal?: AbortSignal
  ) {
    const data = await this.gqlService.gql({
      query: getWorkspaceSubscriptionQuery,
      variables: {
        workspaceId,
      },
      context: {
        signal: abortSignal,
      },
    });

    if (!data.workspace) {
      throw new Error('No workspace');
    }

    return {
      workspaceId: data.workspace.subscription?.id,
      subscription: data.workspace.subscription,
    };
  }

  async mutateResumeSubscription(
    idempotencyKey: string,
    plan?: SubscriptionPlan,
    abortSignal?: AbortSignal,
    workspaceId?: string
  ) {
    const data = await this.gqlService.gql({
      query: resumeSubscriptionMutation,
      variables: {
        plan,
        workspaceId,
      },
      context: {
        signal: abortSignal,
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      },
    });
    return data.resumeSubscription;
  }

  async mutateCancelSubscription(
    idempotencyKey: string,
    plan?: SubscriptionPlan,
    abortSignal?: AbortSignal,
    workspaceId?: string
  ) {
    const data = await this.gqlService.gql({
      query: cancelSubscriptionMutation,
      variables: {
        plan,
        workspaceId,
      },
      context: {
        signal: abortSignal,
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      },
    });
    return data.cancelSubscription;
  }

  getCachedSubscriptions(userId: string) {
    return this.globalCache.get<SubscriptionType[]>(
      SUBSCRIPTION_CACHE_KEY + userId
    );
  }

  setCachedSubscriptions(userId: string, subscriptions: SubscriptionType[]) {
    return this.globalCache.set(SUBSCRIPTION_CACHE_KEY + userId, subscriptions);
  }

  getCachedWorkspaceSubscription(workspaceId: string) {
    return this.globalCache.get<SubscriptionType>(
      SUBSCRIPTION_CACHE_KEY + workspaceId
    );
  }

  setCachedWorkspaceSubscription(
    workspaceId: string,
    subscription: SubscriptionType
  ) {
    return this.globalCache.set(
      SUBSCRIPTION_CACHE_KEY + workspaceId,
      subscription
    );
  }

  setSubscriptionRecurring(
    idempotencyKey: string,
    recurring: SubscriptionRecurring,
    plan?: SubscriptionPlan,
    workspaceId?: string
  ) {
    return this.gqlService.gql({
      query: updateSubscriptionMutation,
      variables: {
        plan,
        recurring,
        workspaceId,
      },
      context: {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      },
    });
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput) {
    const data = await this.gqlService.gql({
      query: createCheckoutSessionMutation,
      variables: {
        input: {
          ...input,
          successCallbackLink:
            input.successCallbackLink ||
            getDefaultSubscriptionSuccessCallbackLink(
              this.serverService.server.baseUrl,
              input.plan,
              this.urlService.getClientScheme()
            ),
        },
      },
    });
    return data.createCheckoutSession;
  }

  async fetchSubscriptionPrices(abortSignal?: AbortSignal) {
    const data = await this.gqlService.gql({
      query: pricesQuery,
      context: {
        signal: abortSignal,
      },
    });

    return data.prices;
  }
}
