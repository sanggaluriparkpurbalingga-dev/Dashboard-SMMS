"use client";

import { useState } from "react";
import { loginAdminAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { getUserWorkspaces } from "@/lib/services/workspace";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await loginAdminAction(formData);

      if (result && result.error) {
        setErrorMsg(result.error);
        return;
      }

      // If loginAdminAction redirects on server, the code below won't even run.
      // But we can add a fallback redirect just in case.
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0c231f] font-sans overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 p-16 relative z-10">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#146b4f] rounded-full blur-[150px] opacity-20 -translate-y-1/2 -z-10" />

        <div className="mb-4">
          <h1 className="text-6xl font-extrabold tracking-tight flex items-center">
            <span className="text-[#10b981]">SANGGA</span>
            <span className="text-white">LURI</span>
          </h1>
        </div>

        <h2 className="text-4xl font-bold text-white mt-4 leading-tight">
          Manage Smarter,
          <br />
          <span className="text-white/50">Achieve More</span>
        </h2>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 z-20">
        <div className="w-full max-w-md bg-[#161E20] p-10 sm:p-14 rounded-[3rem] shadow-2xl relative lg:-ml-12 border border-white/5">
          {/* Mobile Branding (Visible only on small screens) */}
          <div className="lg:hidden mb-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="text-[#10b981]">SANGGA</span>
              <span className="text-white">LURI</span>
            </h1>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Internal Portal
            </h2>
            <p className="text-[#849591] text-sm leading-relaxed px-4">
              Akses eksklusif untuk tim manajemen Sanggaluri.
              <br className="hidden sm:block" />
              Silakan masuk menggunakan kredensial Anda.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg text-center">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#849591] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Email
              </label>
              <input
                type="email"
                placeholder="nama@sanggaluri.id"
                className="w-full px-4 py-3.5 bg-[#0f1516] border border-white/10 text-white placeholder:text-[#455753] rounded-xl outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm"
                onChange={(e) => setEmail(e.target.value)}
                required
                inputMode="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#849591] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-[#0f1516] border border-white/10 text-white placeholder:text-[#455753] rounded-xl outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#052e24] border border-[#10b981]/30 text-white font-semibold rounded-xl hover:bg-[#073d30] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Masuk Dashboard"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#556964] text-xs">
              Lupa password?{" "}
              <Link
                href="/forgot-password"
                className="text-[#10b981] hover:underline"
              >
                Reset di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
