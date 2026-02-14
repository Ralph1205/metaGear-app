import { useState } from "react";
import supabase from "../supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function Login({ setPage }) {
  const [method, setMethod] = useState("google"); // 'google', 'email', or 'admin'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const FIXED_ADMIN_NAME = "COMMANDER";
  const SECRET_ADMIN_EMAIL = "admin@metagear.com";

  // --- AUTH HANDLERS ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert(`AUTH_ERR: ${error.message}`);
    setLoading(false);
  };

  const handleEmailRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Sends a 6-digit OTP code to the provided email
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) alert(`UPLINK_FAILURE: ${error.message}`);
    else setIsOtpSent(true);
    setLoading(false);
  };

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) alert("CIPHER_INVALID");
    else if (data.session) setPage("home");
    setLoading(false);
  };

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (adminName.toUpperCase() !== FIXED_ADMIN_NAME)
        throw new Error("ID_MISMATCH");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: SECRET_ADMIN_EMAIL,
        password: password,
      });
      if (error) throw error;
      if (data.session) setPage("admin");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 font-mono selection:bg-red-600 overflow-hidden relative">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-50" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <div className="max-w-md w-full relative z-10">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-[1000] tracking-tighter italic uppercase">
            META<span className="text-red-600">GEAR</span>_OS
          </h1>
          <div className="flex justify-center gap-2 mt-2">
            <span className="h-1 w-8 bg-red-600" />
            <span className="h-1 w-2 bg-neutral-800" />
            <span className="h-1 w-2 bg-neutral-800" />
          </div>
        </header>

        <div className="border-2 border-neutral-800 bg-neutral-900/40 backdrop-blur-xl relative">
          {/* TACTICAL BORDER ACCENTS */}
          <div className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-4 border-l-4 border-red-600" />
          <div className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-4 border-r-4 border-red-600" />

          <div className="p-8">
            {/* METHOD SELECTOR */}
            {!isOtpSent && (
              <div className="flex border-b border-neutral-800 mb-8">
                {["google", "email", "admin"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                      method === m
                        ? "text-red-500 border-b-2 border-red-600"
                        : "text-neutral-600 hover:text-neutral-400"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {method === "google" && (
                <motion.div
                  key="google"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <p className="text-[10px] text-neutral-500 text-center uppercase tracking-[0.3em]">
                    Identity_Verification_Required
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-4 bg-white text-black py-5 font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all group"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%)",
                    }}
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      className="w-5"
                      alt=""
                    />
                    {loading ? "LINKING..." : "Sign_in_with_Google"}
                  </button>
                </motion.div>
              )}

              {method === "email" && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {!isOtpSent ? (
                    <form onSubmit={handleEmailRequest} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] text-red-600 font-bold uppercase tracking-widest">
                          Email_Frequency
                        </label>
                        <input
                          type="email"
                          placeholder="OPERATOR@METAGEAR.COM"
                          className="w-full bg-black border border-neutral-800 p-4 text-white font-bold outline-none focus:border-red-600 uppercase"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        disabled={loading}
                        className="w-full bg-red-600 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-red-700 disabled:opacity-50"
                      >
                        {loading ? "TRANSMITTING..." : "Transmit_OTP"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleEmailVerify} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] text-green-500 font-bold uppercase tracking-widest animate-pulse">
                          Enter_Email_Cipher
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          className="w-full bg-black border-2 border-green-600 p-4 text-green-500 text-center text-2xl font-black tracking-[0.5em] outline-none"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        disabled={loading}
                        className="w-full bg-green-600 py-4 font-black uppercase text-[10px] tracking-widest disabled:opacity-50"
                      >
                        {loading ? "VERIFYING..." : "Authenticate_Unit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="w-full text-[8px] text-neutral-600 uppercase"
                      >
                        Abort_Transmission
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              {method === "admin" && (
                <motion.form
                  key="admin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleAdminAuth}
                  className="space-y-4"
                >
                  <input
                    placeholder="COMMAND_ID"
                    className="w-full bg-black border border-neutral-800 p-4 text-white font-bold uppercase outline-none focus:border-red-600"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="CIPHER_PASS"
                    className="w-full bg-black border border-neutral-800 p-4 text-white font-bold outline-none focus:border-red-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    disabled={loading}
                    className="w-full bg-red-600 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "OVERRIDING..." : "Execute_Override"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="mt-8 flex justify-between items-center px-2">
          <div className="text-[8px] text-neutral-700 font-bold uppercase tracking-widest">
            Status: <span className="text-green-600">Online</span>
          </div>
          <div className="text-[8px] text-neutral-700 font-bold uppercase tracking-widest">
            V.3.0.1_STABLE
          </div>
        </footer>
      </div>
    </div>
  );
}
