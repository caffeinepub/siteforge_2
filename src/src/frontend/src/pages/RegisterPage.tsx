import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateProfile, useGetCallerUserProfile } from "../hooks/useQueries";

export default function RegisterPage() {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const createProfile = useCreateProfile();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [step, setStep] = useState<"login" | "profile">("login");

  const isLoggingIn = loginStatus === "logging-in";

  useEffect(() => {
    if (identity && isFetched) {
      if (userProfile !== null) {
        // Already has profile, go to dashboard
        navigate({ to: "/dashboard" });
      } else {
        setStep("profile");
      }
    } else if (identity && !profileLoading) {
      setStep("profile");
    }
  }, [identity, userProfile, isFetched, profileLoading, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      console.error("Login error:", err);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) {
      toast.error("Username and display name are required");
      return;
    }
    try {
      await createProfile.mutateAsync({
        username: username.trim(),
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      toast.success("Account created! Welcome to SiteForge.");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  if (isInitializing || (identity && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 hero-glow pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/assets/generated/siteforge-logo-transparent.dim_80x80.png"
              alt="SiteForge"
              className="w-10 h-10 object-contain"
            />
            <span className="font-display font-bold text-2xl text-foreground">
              SiteForge
            </span>
          </Link>
        </div>

        <div className="card-glow bg-card border border-border rounded-2xl p-8">
          {step === "login" ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-4 icon-glow">
                <UserPlus className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                Create Account
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Connect your Internet Identity to get started.
              </p>
              <Button
                className="w-full bg-primary hover:bg-primary/90 font-semibold h-11"
                onClick={handleLogin}
                disabled={isLoggingIn}
                data-ocid="register.login.button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Connect Internet Identity
                  </>
                )}
              </Button>
              <p className="text-muted-foreground text-sm mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                  data-ocid="register.signin.link"
                >
                  Sign In
                </Link>
              </p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <h1 className="font-display font-bold text-2xl text-foreground mb-1">
                  Set Up Your Profile
                </h1>
                <p className="text-muted-foreground text-sm">
                  Just a few more details to complete your account.
                </p>
              </div>
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-foreground">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="bg-input border-border"
                    data-ocid="register.displayname.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@handle"
                    className="bg-input border-border"
                    data-ocid="register.username.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-foreground">
                    Bio (optional)
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={2}
                    className="bg-input border-border resize-none"
                    data-ocid="register.bio.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 font-semibold h-11"
                  disabled={createProfile.isPending}
                  data-ocid="register.submit_button"
                >
                  {createProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
