import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "../supabase";

export default function Header({
  session,
  setPage,
  setDashboardTab,
  cartCount,
  searchQuery,
  setSearchQuery,
  setCart,
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isAdmin = session?.user?.email === "admin@metagear.com";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    setCart([]);
    setPage("landing");
    setIsLoggingOut(false);
    setIsProfileOpen(false);
  };

  const navigateToDashboard = (tab) => {
    setDashboardTab(tab);
    setPage("dashboard");
    setIsProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-[100] bg-[#020202] text-white border-b-2 border-red-600/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* GLITCH LINE TOP */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO SECTION: METAGEAR */}
        <div
          onClick={() => {
            setSearchQuery(""); // Clear search when going home
            setPage("home");
          }}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-red-600 rotate-45 opacity-20 group-hover:opacity-40 transition-all duration-500 blur-sm"></div>
            <div className="relative w-full h-full bg-black border-2 border-red-600 flex items-center justify-center rotate-45 group-hover:rotate-[225deg] transition-all duration-700">
              <img
                src="/logoo.png"
                alt="Logo"
                className="w-6 h-6 -rotate-45 group-hover:-rotate-[225deg] transition-all duration-700 object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-[1000] italic tracking-tighter uppercase leading-none">
              META
              <span className="text-red-600 group-hover:text-white transition-colors">
                GEAR
              </span>
            </h1>
            <span className="text-[7px] font-black tracking-[0.5em] text-red-600/60 uppercase">
              System_Active
            </span>
          </div>
        </div>

        {/* SEARCH LOADOUT: Tactical Input */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 z-10 group-focus-within:scale-110 transition-transform">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="SEARCH_LOADOUT..."
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-sm px-12 py-2 text-[10px] font-black tracking-[0.2em] focus:outline-none focus:border-red-600 focus:bg-black transition-all placeholder:text-neutral-700 uppercase"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <span className="w-1 h-1 bg-red-600 animate-pulse"></span>
            <span className="w-1 h-1 bg-red-600 animate-pulse delay-75"></span>
          </div>
        </div>

        {/* ACTIONS & AUTH */}
        <nav className="flex items-center gap-4">
          {!isAdmin && (
            <button
              onClick={() => setPage("cart")}
              className="relative p-2.5 bg-neutral-900 border border-neutral-800 hover:border-red-600 transition-all group"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border border-black shadow-[0_0_10px_#ff0000]">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {session ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-3 bg-neutral-900/50 border p-1.5 pr-4 rounded-sm transition-all ${isAdmin ? "border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]" : "border-neutral-800 hover:border-red-600"}`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center font-black text-[10px] ${isAdmin ? "bg-red-600 text-white" : "bg-white text-black"}`}
                >
                  {isAdmin ? "OP" : session.user.email[0].toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-[6px] font-black text-red-600 uppercase tracking-tighter leading-none">
                    {isAdmin ? "ROOT_ACCESS" : "OPERATOR"}
                  </p>
                  <p className="text-[10px] font-black uppercase text-white truncate max-w-[80px]">
                    {isAdmin ? "ADMIN" : session.user.email.split("@")[0]}
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-3 w-56 bg-black border border-red-600 shadow-[0_20px_40px_rgba(0,0,0,0.9)] rounded-sm overflow-hidden z-20"
                    >
                      <div className="p-4 border-b border-neutral-900">
                        <p className="text-[7px] font-black text-red-600 uppercase tracking-widest mb-1">
                          DATA_STREAM_ENCRYPTED
                        </p>
                        <p className="text-[10px] font-bold text-neutral-400 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="p-1">
                        {isAdmin ? (
                          <button
                            onClick={() => {
                              setPage("admin");
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center justify-between p-3 text-[9px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all"
                          >
                            DASHBOARD_CORE <span>[SECURE]</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => navigateToDashboard("profile")}
                              className="w-full text-left p-3 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
                            >
                              PERSONNEL_FILE
                            </button>
                            <button
                              onClick={() => navigateToDashboard("manifests")}
                              className="w-full text-left p-3 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
                            >
                              ORDER_MANIFESTS
                            </button>
                          </>
                        )}
                        <div className="h-[1px] bg-neutral-900 my-1" />
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full p-3 text-red-600 hover:bg-red-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          {isLoggingOut ? "TERMINATING..." : "ABORT_SESSION"}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setPage("login")}
              className="bg-red-600 text-white px-6 py-2 text-[10px] font-[1000] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              INITIALIZE_LOGIN
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
