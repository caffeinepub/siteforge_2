// Social system utilities stored in localStorage
// Follow system: sf_follows = { [followerPrincipal]: string[] }
// Verified system: sf_verified_principals = string[]

const FOLLOWS_KEY = "sf_follows";
const VERIFIED_KEY = "sf_verified_principals";

function loadFollows(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(FOLLOWS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string[]>;
  } catch {
    return {};
  }
}

function saveFollows(data: Record<string, string[]>): void {
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(data));
}

function loadVerified(): string[] {
  try {
    const raw = localStorage.getItem(VERIFIED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveVerified(data: string[]): void {
  localStorage.setItem(VERIFIED_KEY, JSON.stringify(data));
}

// --- Follow system ---

export function followUser(myPrincipal: string, targetPrincipal: string): void {
  if (!myPrincipal || !targetPrincipal || myPrincipal === targetPrincipal)
    return;
  const follows = loadFollows();
  if (!follows[myPrincipal]) follows[myPrincipal] = [];
  if (!follows[myPrincipal].includes(targetPrincipal)) {
    follows[myPrincipal].push(targetPrincipal);
    saveFollows(follows);
  }
}

export function unfollowUser(
  myPrincipal: string,
  targetPrincipal: string,
): void {
  if (!myPrincipal || !targetPrincipal) return;
  const follows = loadFollows();
  if (!follows[myPrincipal]) return;
  follows[myPrincipal] = follows[myPrincipal].filter(
    (p) => p !== targetPrincipal,
  );
  saveFollows(follows);
}

export function isFollowing(
  myPrincipal: string,
  targetPrincipal: string,
): boolean {
  if (!myPrincipal || !targetPrincipal) return false;
  const follows = loadFollows();
  return (follows[myPrincipal] ?? []).includes(targetPrincipal);
}

export function getFollowing(myPrincipal: string): string[] {
  if (!myPrincipal) return [];
  const follows = loadFollows();
  return follows[myPrincipal] ?? [];
}

export function getFollowers(
  targetPrincipal: string,
  allPrincipals: string[],
): string[] {
  if (!targetPrincipal) return [];
  const follows = loadFollows();
  return allPrincipals.filter((p) =>
    (follows[p] ?? []).includes(targetPrincipal),
  );
}

// --- Verified / blue tick system ---

export function isVerified(principal: string): boolean {
  if (!principal) return false;
  return loadVerified().includes(principal);
}

export function getVerifiedPrincipals(): string[] {
  return loadVerified();
}

export function setVerified(principal: string, verified: boolean): void {
  if (!principal) return;
  let list = loadVerified();
  if (verified) {
    if (!list.includes(principal)) {
      list.push(principal);
    }
  } else {
    list = list.filter((p) => p !== principal);
  }
  saveVerified(list);
}
