"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/services/auth";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengirim link reset password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c231f] font-sans p-6 sm:p-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-[#146b4f] rounded-full blur-[150px] opacity-20 -translate-x-1/2 -translate-y-1/2 -z-10" />

      <div className="w-full max-w-md bg-[#161E20] p-10 sm:p-14 rounded-[3rem] shadow-2xl relative z-10 border border-white/5">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#052e24] border border-[#10b981]/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#10b981]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Lupa Password?</h1>
          <p className="text-[#849591] text-sm leading-relaxed px-2">
            Masukkan email yang terdaftar. Kami akan mengirimkan link untuk
            mereset password Anda.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl">
              <p className="text-[#10b981] text-sm font-medium">
                Link reset password telah dikirim ke <strong>{email}</strong>.
              </p>
              <p className="text-[#849591] text-xs mt-2">
                Silakan cek kotak masuk atau folder spam Anda.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-[#10b981] hover:text-[#34d399] transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#849591] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Email Admin
              </label>
              <input
                type="email"
                placeholder="nama@sanggaluri.id"
                className="w-full px-4 py-3.5 bg-[#0f1516] border border-white/10 text-white placeholder:text-[#455753] rounded-xl outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                inputMode="email"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#052e24] border border-[#10b981]/30 text-white font-semibold rounded-xl hover:bg-[#073d30] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Kirim Link Reset"
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-[#556964] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke halaman login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
