import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Dashboard,
  ShoppingItem,
  Site,
  Transaction,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

// LoginEvent type (mirrors backend.d.ts contract)
export interface LoginEvent {
  principal: Principal;
  loginAt: bigint;
}

// ============ Read-tracking helpers for Chat ============
function getLastReadTimestamp(
  myPrincipal: string,
  partnerPrincipal: string,
): number {
  const key = `chat_read_${myPrincipal}_${partnerPrincipal}`;
  return Number(localStorage.getItem(key) ?? "0");
}

export function markConversationAsRead(
  myPrincipal: string,
  partnerPrincipal: string,
): void {
  const key = `chat_read_${myPrincipal}_${partnerPrincipal}`;
  localStorage.setItem(key, Date.now().toString());
}

// ============ User Profile ============
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      displayName,
      bio,
    }: {
      username: string;
      displayName: string;
      bio: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createProfile(username, displayName, bio);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useUpdateDisplayName() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateDisplayName(name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useUpdateUsername() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateUsername(username);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useUpdateBio() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bio: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBio(bio);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ============ Sites ============
export function useGetUserDashboard() {
  const { actor, isFetching } = useActor();
  return useQuery<Dashboard>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!actor) return { sites: [], listings: [], transactions: [] };
      return actor.getUserDashboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSiteById(siteId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Site>({
    queryKey: ["site", siteId],
    queryFn: async () => {
      if (!actor || !siteId) throw new Error("No actor or siteId");
      return actor.getSiteById(siteId);
    },
    enabled: !!actor && !isFetching && !!siteId,
  });
}

export function useCreateSite() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      content,
    }: {
      title: string;
      description: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createSite(title, description, content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateSite() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      content,
    }: {
      id: string;
      title: string;
      description: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSite(id, title, description, content);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["site", vars.id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function usePublishSite() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (siteId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.publishSite(siteId);
    },
    onSuccess: (_data, siteId) => {
      qc.invalidateQueries({ queryKey: ["site", siteId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useListSite() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      price,
      listingDescription,
    }: {
      id: string;
      price: bigint;
      listingDescription: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.listSite(id, price, listingDescription);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
}

export function useUnlistSite() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (siteId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unlistSite(siteId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
}

// ============ Marketplace ============
export function useGetMarketplaceListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Site[]>({
    queryKey: ["marketplace"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMarketplaceListings();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============ Stripe / Transactions ============
export type CheckoutSession = { id: string; url: string };

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error("Actor not available");
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/purchase-success`;
      const cancelUrl = `${baseUrl}/marketplace`;
      const result = await actor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) throw new Error("Stripe session missing url");
      return session;
    },
  });
}

export function useCreatePendingTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      siteId,
      paymentIntentId,
    }: { siteId: string; paymentIntentId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPendingTransaction(siteId, paymentIntentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useFinalizeTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transactionId,
      billOfSale,
    }: {
      transactionId: string;
      billOfSale: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.finalizeTransaction(transactionId, billOfSale);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
}

export function useGetTransactionById(id: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      if (!actor || !id) throw new Error("No actor or id");
      return actor.getTransactionById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripeSession", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) throw new Error("No actor or sessionId");
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    retry: 3,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============ Admin ============
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      secretKey,
      allowedCountries,
    }: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setStripeConfiguration({ secretKey, allowedCountries });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stripeConfigured"] });
    },
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: { user: string; role: import("../backend").UserRole }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.assignCallerUserRole(Principal.fromText(user), role);
    },
  });
}

export function useGetLoginEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<LoginEvent[]>({
    queryKey: ["loginEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getLoginEvents() as Promise<LoginEvent[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useRecordLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).recordLogin() as Promise<void>;
    },
  });
}

// ============ Chat ============
export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend").UserDirectoryEntry[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useGetMessages(partnerPrincipal: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend").ChatMessage[]>({
    queryKey: ["messages", partnerPrincipal],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.getMessages(Principal.fromText(partnerPrincipal));
    },
    enabled: !!actor && !isFetching && !!partnerPrincipal,
    refetchInterval: 2_000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ to, content }: { to: Principal; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendMessage(to, content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useProposeTradeMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ to, siteId }: { to: Principal; siteId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.proposeTrade(to, siteId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useRespondToTradeProposal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      messageId,
      accept,
    }: { messageId: string; accept: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.respondToTradeProposal(messageId, accept);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useUnreadMessageCount(myPrincipal: string) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["unreadCount", myPrincipal],
    queryFn: async () => {
      if (!actor || !myPrincipal) return 0;
      const { Principal } = await import("@icp-sdk/core/principal");
      const allUsers = await actor.getAllUsers();
      const others = allUsers.filter(
        (u) => u.principal.toString() !== myPrincipal,
      );
      let total = 0;
      await Promise.all(
        others.map(async (u) => {
          const partnerStr = u.principal.toString();
          try {
            const msgs = await actor.getMessages(
              Principal.fromText(partnerStr),
            );
            const lastRead = getLastReadTimestamp(myPrincipal, partnerStr);
            for (const msg of msgs) {
              const msgMs = Number(msg.timestamp) / 1_000_000;
              if (msg.sender.toString() !== myPrincipal && msgMs > lastRead) {
                total++;
              }
            }
          } catch {
            // silently ignore per-conversation errors
          }
        }),
      );
      return total;
    },
    enabled: !!actor && !isFetching && !!myPrincipal,
    refetchInterval: 3_000,
  });
}

export function useInitializeAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (secret: string) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any)._initializeAccessControlWithSecret(secret);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["isCallerAdmin"] });
    },
  });
}
