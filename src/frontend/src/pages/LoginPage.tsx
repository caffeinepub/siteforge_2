import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { useEffect, useRef } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRecordLogin } from "../hooks/useQueries";

export default function LoginPage() {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();
  const { actor } = useActor();
  const recordLogin = useRecordLogin();
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (identity && actor && !hasRecorded.current) {
      hasRecorded.current = true;
      recordLogin.mutate();
      navigate({ to: "/dashboard" });
    }
  }, [identity, actor, navigate, recordLogin]);

  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      console.error("Login error:", err);
    }
  };

  if (isInitializing) {
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
        {/* Logo */}
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
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-4 icon-glow">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in with Internet Identity to access your dashboard.
            </p>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 font-semibold h-11"
            onClick={handleLogin}
            disabled={isLoggingIn}
            data-ocid="login.submit_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In with Internet Identity
              </>
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
                data-ocid="login.register.link"
              >
                Get Started Free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by Internet Identity — your keys, your identity.
        </p>
      </div>
    </div>
  );
}
