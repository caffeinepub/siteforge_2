import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  followUser,
  getFollowers,
  getFollowing,
  isFollowing,
  isVerified,
  unfollowUser,
} from "../lib/socialStore";
import { VerifiedBadge } from "./VerifiedBadge";

interface UserProfile {
  displayName: string;
  username: string;
  bio: string;
  joinedAt: bigint;
}

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  principal: string;
  profile: UserProfile | null;
  myPrincipal: string;
  allPrincipals?: string[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatJoinDate(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

const AVATAR_COLORS = [
  "bg-blue-500/20 text-blue-400",
  "bg-purple-500/20 text-purple-400",
  "bg-green-500/20 text-green-400",
  "bg-orange-500/20 text-orange-400",
  "bg-pink-500/20 text-pink-400",
  "bg-teal-500/20 text-teal-400",
];

function getAvatarColor(principal: string) {
  const idx = principal.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function UserProfileModal({
  open,
  onClose,
  principal,
  profile,
  myPrincipal,
  allPrincipals = [],
}: UserProfileModalProps) {
  const [followToggle, setFollowToggle] = useState(0);
  const isSelf = principal === myPrincipal;
  const verified = isVerified(principal);
  const following = isFollowing(myPrincipal, principal);
  const followersCount = getFollowers(principal, allPrincipals).length;
  const followingCount = getFollowing(principal).length;

  const displayName = profile?.displayName ?? "Unknown User";
  const username = profile?.username ?? "";

  const handleFollowToggle = () => {
    if (following) {
      unfollowUser(myPrincipal, principal);
    } else {
      followUser(myPrincipal, principal);
    }
    setFollowToggle((v) => v + 1);
  };

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(principal).then(() => {
      toast.success("Principal ID copied!");
    });
  };

  // Suppress unused variable warning — followToggle is used to force re-render
  void followToggle;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-sm"
        data-ocid="profile.modal"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 pt-2 pb-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarFallback
                className={`text-2xl font-bold ${getAvatarColor(principal)}`}
              >
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            {verified && (
              <span className="absolute -bottom-1 -right-1">
                <VerifiedBadge size="lg" />
              </span>
            )}
          </div>

          {/* Name & Username */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-lg font-bold text-foreground">
                {displayName}
              </h2>
              {verified && <VerifiedBadge />}
            </div>
            {username && (
              <p className="text-sm text-muted-foreground mt-0.5">
                @{username}
              </p>
            )}
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-center border border-border rounded-xl px-6 py-3 bg-background/50 w-full justify-center">
            <div>
              <p className="text-lg font-bold text-foreground">
                {followersCount}
              </p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-lg font-bold text-foreground">
                {followingCount}
              </p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            {profile?.joinedAt !== undefined && (
              <>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {formatJoinDate(profile.joinedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">Joined</p>
                </div>
              </>
            )}
          </div>

          {/* Follow button */}
          {!isSelf && (
            <Button
              onClick={handleFollowToggle}
              variant={following ? "default" : "outline"}
              className={
                following
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                  : "border-primary/40 text-primary hover:bg-primary/10 w-full"
              }
              data-ocid="profile.follow.button"
            >
              {following ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          )}

          {/* Principal ID */}
          <div className="w-full">
            <p className="text-xs text-muted-foreground mb-1.5">Principal ID</p>
            <div className="flex items-center gap-2 bg-background/50 border border-border rounded-lg px-3 py-2">
              <span className="font-mono text-xs text-foreground truncate flex-1">
                {principal}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                onClick={handleCopyPrincipal}
                data-ocid="profile.copy_principal.button"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
