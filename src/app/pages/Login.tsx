import { FormEvent, useState } from "react";
import { useNavigate, NavLink } from "react-router";
import { Leaf, Lock, Mail } from "lucide-react";
import { Card, Field, Input, SectionEyebrow } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { loginUser } from "../lib/api";
import { useI18n, LangCode } from "../lib/i18n";

export default function Login() {
  const navigate = useNavigate();
  const { setLang } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginUser({ email, password });
      
      // Save credentials locally
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.profile));
      
      if (res.profile.preferredLanguage) {
        setLang(res.profile.preferredLanguage as LangCode);
        localStorage.setItem("language", res.profile.preferredLanguage);
      }

      // Route accordingly
      if (res.profile.userType === "farmer") {
        navigate("/dashboard");
      } else {
        navigate("/marketplace");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <span className="w-12 h-12 rounded-full bg-canopy text-husk inline-flex items-center justify-center mb-4 shadow-sm">
          <Leaf size={22} />
        </span>
        <SectionEyebrow>Welcome Back</SectionEyebrow>
        <h1 className="font-display text-3xl font-semibold text-forest-dark">Sign in to Agrinova</h1>
        <p className="text-ink-soft text-sm mt-1">Connecting Indian farmers directly to households</p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-alert/10 border border-alert text-alert text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Email Address">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </Field>

          <Field label="Password">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </Field>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>

          <div className="text-center pt-2 border-t border-forest/10 mt-4 text-sm text-ink-soft">
            Don't have an account?{" "}
            <NavLink to="/register" className="text-canopy hover:underline font-semibold">
              Register here
            </NavLink>
          </div>
        </form>
      </Card>
    </div>
  );
}
