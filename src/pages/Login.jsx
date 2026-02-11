import { useState } from "react";
import supabase from "../supabase";
import { motion } from "framer-motion";

export default function Login({ setPage }) {
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const FIXED_ADMIN_NAME = "COMMANDER";
  const SECRET_ADMIN_EMAIL = "admin@metagear.com";

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (adminName.toUpperCase() !== FIXED_ADMIN_NAME) {
        throw new Error("ACCESS_DENIED: UNAUTHORIZED_ENTITY");
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: SECRET_ADMIN_EMAIL,
        password: password,
      });
      if (error) throw error;
      if (data.session) setPage("admin");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 py-12 relative overflow-hidden font-sans">
      {/* TACTICAL OVERLAYS */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

      {/* SCANLINE EFFECT */}
      <motion.div
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-full h-[2px] bg-red-600/20 z-10 pointer-events-none shadow-[0_0_15px_red]"
      />

      {/* BACKGROUND WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[25vw] font-[1000] text-white/[0.02] italic tracking-tighter uppercase leading-none rotate-[-12deg]">
          STRICT_ACCESS
        </h1>
      </div>

      <div className="max-w-md w-full relative z-20">
        <div
          className="bg-neutral-900 border border-red-600/50 relative overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.8)]"
          style={{
            clipPath: "polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)",
          }}
        >
          {/* TOP ACCENT BAR */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent" />

          <div className="p-10 pt-12">
            <div className="text-center mb-12">
              <div className="inline-block bg-red-600 text-black font-black px-4 py-1 text-[9px] uppercase tracking-[0.4em] mb-4 italic">
                S_LEVEL_AUTHENTICATION
              </div>
              <h2 className="text-5xl font-[1000] uppercase italic tracking-tighter text-white leading-none">
                {isAdminMode ? "CMD_SYSTEM" : "ACCESS_POINT"}
              </h2>
              <div className="mt-2 h-[1px] w-12 bg-red-600 mx-auto animate-pulse" />
            </div>

            {!isAdminMode ? (
              <div className="space-y-6">
                <button
                  onClick={handleGoogleLogin}
                  className="group relative w-full flex items-center justify-center gap-4 bg-white text-black py-6 font-black uppercase tracking-widest text-xs transition-all hover:bg-red-600 hover:text-white"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% 70%, 94% 100%, 0 100%)",
                  }}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="w-5 grayscale group-hover:grayscale-0"
                    alt="G"
                  />
                  Continue with Agent_ID
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="flex-grow h-[1px] bg-neutral-800"></div>
                  <span className="text-neutral-600 font-mono text-[9px] font-bold italic tracking-widest">
                    ENCRYPTED_OR
                  </span>
                  <div className="flex-grow h-[1px] bg-neutral-800"></div>
                </div>

                <button
                  onClick={() => setIsAdminMode(true)}
                  className="w-full py-4 border border-red-600/20 text-[10px] font-black text-red-600/60 uppercase tracking-[0.5em] hover:bg-red-600/10 hover:text-red-500 transition-all shadow-[inset_0_0_0_0_red]"
                >
                  {">"} Restricted Admin Console
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdminAuth} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-red-600 tracking-[0.3em] block ml-1">
                    Commander_Key
                  </label>
                  <input
                    type="text"
                    placeholder="ENTER_ID"
                    className="w-full bg-black/50 border border-neutral-800 p-5 text-white font-black outline-none focus:border-red-600 transition-all uppercase text-sm tracking-widest placeholder:text-neutral-800"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-red-600 tracking-[0.3em] block ml-1">
                    Security_Cipher
                  </label>
                  <input
                    type="password"
                    placeholder="********"
                    className="w-full bg-black/50 border border-neutral-800 p-5 text-white font-black outline-none focus:border-red-600 transition-all text-sm tracking-[0.5em]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-red-600 text-white font-[1000] py-6 uppercase tracking-[0.3em] text-xs italic transition-all hover:bg-white hover:text-black disabled:opacity-50"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)",
                  }}
                >
                  {loading ? "DATA_SYNCING..." : "INITIALIZE_OVERRIDE"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdminMode(false)}
                  className="w-full text-[9px] font-black text-neutral-600 text-center uppercase tracking-[0.4em] hover:text-white transition-colors"
                >
                  // ABORT_CONNECTION
                </button>
              </form>
            )}
          </div>
        </div>

        {/* EXTERNAL DECORATIVE BORDERS */}
        <div className="absolute -top-6 -left-6 w-12 h-12 border-t border-l border-red-600 pointer-events-none opacity-40"></div>
        <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b border-r border-red-600 pointer-events-none opacity-40"></div>
        <div className="absolute top-1/2 -left-12 w-8 h-[1px] bg-red-600 opacity-20 rotate-90"></div>
        <div className="absolute top-1/2 -right-12 w-8 h-[1px] bg-red-600 opacity-20 rotate-90"></div>
      </div>
    </div>
  );
}
