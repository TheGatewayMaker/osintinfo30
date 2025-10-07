import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { signInWithGoogle, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to continue with Google right now. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.brand.500/10),transparent_50%)]" />
        <div className="container mx-auto">
          <div className="mx-auto max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-black tracking-tight">Sign in</h1>
              <p className="mt-2 text-sm text-foreground/60">
                Continue securely with your Google account
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur p-6">
              {error && (
                <p className="mb-4 text-sm text-destructive">{error}</p>
              )}

              <div className="grid gap-3">
                <Button
                  variant="secondary"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-foreground hover:bg-background/80 dark:bg-card dark:text-foreground"
                  onClick={handleGoogle}
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303C33.173,32.659,29.005,36,24,36c-6.627,0-12-5.373-12-12  s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,16.041,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657  C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.005,0,9.787-1.997,13.303-5.243l-6.146-5.195C29.109,35.091,26.66,36,24,36  c-5.005,0-9.173-3.341-10.651-7.917l-6.571,5.061C9.656,39.663,16.318,44,24,44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.083,3.163-3.313,5.658-6.146,7.043l0.001-0.001l6.146,5.195  C33.707,41.637,44,36,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                  </svg>
                  {loading ? "Please wait…" : "Continue with Google"}
                </Button>
                <p className="text-xs text-foreground/60 text-center">
                  Email/password sign-in is disabled. Use Google to access your
                  account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
