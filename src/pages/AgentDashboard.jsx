import React, { useState, useEffect } from "react";
import supabase from "../supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentDashboard({ session, activeTab, setActiveTab }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const [time, setTime] = useState(new Date());

  // Live Clock for the Intel Panel
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchUserOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items(*, products(*))`)
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: false });

      if (!error) setOrders(data);
      setLoading(false);
    }
    if (session) fetchUserOrders();
  }, [session]);

  const handlePurgeOrder = async (orderId) => {
    const confirmPurge = window.confirm("CRITICAL: PURGE MANIFEST?");
    if (!confirmPurge) return;
    setIsProcessing(orderId);
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (!error) setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setIsProcessing(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row pt-20 font-sans overflow-hidden">
      {/* 01. LEFT SIDEBAR (NAV) */}
      <aside className="w-full md:w-60 border-r border-neutral-900 bg-black/50 p-6 flex flex-col gap-8 shrink-0">
        <div className="space-y-1">
          <p className="text-red-600 font-mono text-[8px] uppercase tracking-[0.4em] animate-pulse">
            Status: Active_Duty
          </p>
          <h2 className="text-2xl font-[1000] italic tracking-tighter uppercase leading-tight">
            Welcome, <br />
            <span className="text-red-600">Soldier</span>
          </h2>
          <p className="text-neutral-600 font-mono text-[8px] truncate opacity-60">
            {session?.user?.email}
          </p>
        </div>
        <nav className="flex flex-col gap-2">
          {["manifests", "profile"].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeTab === tab
                  ? "bg-red-600 border-red-600 text-black shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                  : "border-neutral-800 text-neutral-500 hover:border-red-600"
              }`}
            >
              {tab === "manifests" ? "Intel_Ops" : "Personnel_File"}
              <span className="opacity-50 text-[8px]">[0{idx + 1}]</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* 02. CENTER CONTENT (MANIFESTS) */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {activeTab === "manifests" ? (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter border-b border-red-600 pb-2 inline-block">
                Order_Manifests
              </h3>
              {loading ? (
                <p className="font-mono text-red-600 text-xs animate-pulse">
                  // DECRYPTING...
                </p>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-neutral-900/20 border border-neutral-800 p-6 hover:border-red-600/30 transition-all"
                    >
                      {/* ... existing order card content ... */}
                      <div className="flex justify-between items-center mb-4 border-b border-neutral-800/50 pb-4">
                        <p className="text-sm font-black italic">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-2xl font-[1000] italic text-white">
                          ₱{order.total_price?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        {order.order_items?.map((item, idx) => (
                          <img
                            key={idx}
                            src={item.products?.image_url}
                            className="w-12 h-12 object-cover grayscale border border-neutral-800"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          ) : (
            <section className="max-w-2xl mx-auto">
              {/* ... Personnel File Content ... */}
              <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter border-b border-red-600 pb-2 mb-8">
                Personnel_File
              </h3>
              <div className="bg-neutral-900/40 border border-neutral-800 p-6">
                <p className="text-[10px] text-red-600 font-bold uppercase mb-4">
                  Current_Assigned_Identity
                </p>
                <p className="text-2xl font-black uppercase text-white tracking-tighter italic">
                  FLORES RALPH
                </p>
              </div>
            </section>
          )}
        </AnimatePresence>
      </main>

      {/* 03. NEW RIGHT PANEL (SYSTEM INTEL) */}
      <aside className="hidden xl:flex w-72 border-l border-neutral-900 bg-black/30 p-6 flex-col gap-8 shrink-0">
        <div className="space-y-6">
          {/* SYSTEM TIME */}
          <div className="border border-neutral-800 p-4 bg-black/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-red-600/20" />
            <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest mb-1">
              Local_Time_Sync
            </p>
            <p className="text-2xl font-mono font-bold text-white tracking-tighter">
              {time.toLocaleTimeString([], { hour12: false })}
            </p>
            <p className="text-[8px] font-mono text-red-600/60 mt-1 uppercase">
              Region: PH_Sector_01
            </p>
          </div>

          {/* STATUS LOGS */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              Live_System_Logs
            </h4>
            <div className="space-y-3 font-mono text-[9px]">
              {[
                {
                  label: "CORE",
                  msg: "Encrypted link stable",
                  color: "text-green-500",
                },
                {
                  label: "DATABASE",
                  msg: "Supabase connection active",
                  color: "text-blue-500",
                },
                {
                  label: "SECURITY",
                  msg: "Firewall level 04 active",
                  color: "text-red-500",
                },
                {
                  label: "LOGISTICS",
                  msg: "Manifest sync 100%",
                  color: "text-neutral-500",
                },
              ].map((log, i) => (
                <div
                  key={i}
                  className="flex gap-3 border-l border-neutral-800 pl-3 py-1"
                >
                  <span className={`font-bold ${log.color}`}>
                    [{log.label}]
                  </span>
                  <span className="text-neutral-500 italic">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ALERT LEVEL VISUAL */}
          <div className="pt-6 border-t border-neutral-900">
            <p className="text-[9px] font-mono text-neutral-600 uppercase mb-3">
              Threat_Level_Indicator
            </p>
            <div className="flex gap-1 h-6">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 ${i < 4 ? "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "bg-neutral-900"}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[8px] font-mono text-neutral-500">
              <span>MIN_THREAT</span>
              <span className="text-red-600 font-bold">ALPHA_ALERT</span>
            </div>
          </div>
        </div>

        {/* LOGOUT AT THE BOTTOM */}
        <div className="mt-auto">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full border border-neutral-800 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-white hover:border-red-600 transition-all"
          >
            Terminal_Sign_Out
          </button>
        </div>
      </aside>
    </div>
  );
}
