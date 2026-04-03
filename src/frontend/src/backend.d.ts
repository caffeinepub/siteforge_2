import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserDirectoryEntry {
    principal: Principal;
    profile?: UserProfile;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Listing {
    listedAt: bigint;
    price: bigint;
    listingDescription: string;
}
export interface LoginEvent {
    principal: Principal;
    loginAt: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Transaction {
    id: string;
    status: {
        __kind__: "cancelled";
        cancelled: string;
    } | {
        __kind__: "pending";
        pending: string;
    } | {
        __kind__: "completed";
        completed: {
            billOfSale: string;
        };
    };
    createdAt: bigint;
    seller: Principal;
    stripePaymentIntentId: string;
    buyer: Principal;
    siteId: string;
    price: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Site {
    id: string;
    status: {
        __kind__: "published";
        published: string;
    } | {
        __kind__: "sold";
        sold: {
            billOfSale: string;
            salePrice: bigint;
            buyer: Principal;
        };
    } | {
        __kind__: "draft";
        draft: null;
    } | {
        __kind__: "listed";
        listed: Listing;
    };
    title: string;
    content: string;
    owner: Principal;
    createdAt: bigint;
    description: string;
    updatedAt: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Dashboard {
    listings: Array<Site>;
    sites: Array<Site>;
    transactions: Array<Transaction>;
}
export interface ChatMessage {
    id: string;
    tradeProposalStatus?: Variant_pending_accepted_declined;
    content: string;
    sender: Principal;
    timestamp: bigint;
    tradeProposalSiteId?: string;
    receiver: Principal;
    tradeProposalSiteTitle?: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    bio: string;
    username: string;
    displayName: string;
    joinedAt: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_accepted_declined {
    pending = "pending",
    accepted = "accepted",
    declined = "declined"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPendingTransaction(siteId: string, paymentIntentId: string): Promise<string>;
    createProfile(username: string, displayName: string, bio: string): Promise<void>;
    createSite(title: string, description: string, content: string): Promise<string>;
    finalizeTransaction(transactionId: string, billOfSale: string): Promise<void>;
    getAllUsers(): Promise<Array<UserDirectoryEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLoginEvents(): Promise<Array<LoginEvent>>;
    getMarketplaceListingIds(): Promise<Array<string>>;
    getMarketplaceListings(): Promise<Array<Site>>;
    getMessages(partner: Principal): Promise<Array<ChatMessage>>;
    getProfile(user: Principal): Promise<UserProfile>;
    getSiteById(siteId: string): Promise<Site>;
    getSiteByTitle(title: string): Promise<Site>;
    getSitesByOwner(owner: Principal): Promise<Array<Site>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTransactionById(id: string): Promise<Transaction>;
    getUserDashboard(): Promise<Dashboard>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isSiteListed(siteId: string): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listSite(id: string, price: bigint, listingDescription: string): Promise<void>;
    proposeTrade(to: Principal, siteId: string): Promise<string>;
    publishSite(siteId: string): Promise<string>;
    recordLogin(): Promise<void>;
    respondToTradeProposal(messageId: string, accept: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(to: Principal, content: string): Promise<string>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unlistSite(siteId: string): Promise<void>;
    updateBio(bio: string): Promise<void>;
    updateDisplayName(displayName: string): Promise<void>;
    updateSite(id: string, title: string, description: string, content: string): Promise<void>;
    updateUsername(username: string): Promise<void>;
}
