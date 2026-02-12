import React, { useState, useEffect } from "react";
import supabase from "../supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentDashboard({ session, activeTab, setActiveTab }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const [time, setTime] = useState(new Date());

  // NEW: Granular State for Address
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(
    session?.user?.user_metadata?.full_name || "",
  );
  const [street, setStreet] = useState(
    session?.user?.user_metadata?.street || "",
  );
  const [city, setCity] = useState(session?.user?.user_metadata?.city || "");
  const [province, setProvince] = useState(
    session?.user?.user_metadata?.province || "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const agentName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "Unknown_Agent";

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

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: newName,
        street,
        city,
        province,
      },
    });

    if (error) {
      alert("SYNC_ERROR: " + error.message);
    } else {
      setIsEditing(false);
      window.location.reload();
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row pt-20 font-sans overflow-hidden">
      {/* 01. LEFT SIDEBAR */}
      <aside className="w-full md:w-60 border-r border-neutral-900 bg-black/50 p-6 flex flex-col gap-8 shrink-0">
        <div className="space-y-1">
          <p className="text-red-600 font-mono text-[8px] uppercase tracking-[0.4em] animate-pulse">
            Status: Active_Duty
          </p>
          <h2 className="text-2xl font-[1000] italic tracking-tighter uppercase leading-tight">
            Welcome, <br />
            <span className="text-red-600">
              {session?.user?.user_metadata?.full_name?.split(" ")[0] ||
                "Soldier"}
            </span>
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

      {/* 02. CENTER CONTENT */}
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
                      className="bg-neutral-900/20 border border-neutral-800 p-6 hover:border-red-600/30 transition-all relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Tactical Header */}
                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 border-b border-neutral-800/50 pb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-red-600 uppercase tracking-widest">
                            {/* FIXED ERROR HERE */}
                            Manifest_ID: {order.id.toString().slice(0, 8)}
                          </p>
                          <p className="text-sm font-black italic">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-mono text-neutral-500 uppercase">
                            Total_Expenditure
                          </p>
                          <p className="text-2xl font-[1000] italic text-white">
                            ₱{order.total_price?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Order Intel Details */}
                      <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-3">
                          {order.order_items?.map((item, idx) => (
                            <div key={idx} className="relative group/item">
                              <img
                                src={item.products?.image_url}
                                className="w-14 h-14 object-cover grayscale hover:grayscale-0 border border-neutral-800 transition-all"
                                alt="asset"
                              />
                              <span className="absolute -top-2 -right-2 bg-red-600 text-[9px] px-1.5 py-0.5 font-bold shadow-lg">
                                x{item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-right">
                          <div>
                            <p className="text-[8px] font-mono text-neutral-500 uppercase">
                              Payload_Count
                            </p>
                            <p className="text-xs font-bold font-mono">
                              {order.order_items?.length || 0} Assets
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] font-mono text-neutral-500 uppercase">
                              Logistics_Status
                            </p>
                            <span className="text-[10px] font-black uppercase text-green-500">
                              In_Transit
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          ) : (
            <section className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter border-b border-red-600 pb-2 mb-8">
                Personnel_File
              </h3>
              <div className="bg-neutral-900/40 border border-neutral-800 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-full space-y-6">
                    {/* Codename Section */}
                    <div>
                      <p className="text-[10px] text-red-600 font-bold uppercase mb-2">
                        Assigned_Codename
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full bg-black border border-red-600 text-white p-2 text-xl font-black uppercase italic outline-none focus:shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                        />
                      ) : (
                        <p className="text-3xl font-black uppercase text-white tracking-tighter italic">
                          {agentName}
                        </p>
                      )}
                    </div>

                    {/* Bit-by-bit Address Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[8px] text-neutral-500 uppercase font-mono mb-1">
                          Street_Sector
                        </p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className="w-full bg-black border border-neutral-700 text-white p-1 text-xs font-mono uppercase outline-none focus:border-red-600"
                          />
                        ) : (
                          <p className="text-[10px] font-mono uppercase text-neutral-300 border-b border-neutral-800 pb-1">
                            {street || "---"}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[8px] text-neutral-500 uppercase font-mono mb-1">
                          City_Zone
                        </p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-black border border-neutral-700 text-white p-1 text-xs font-mono uppercase outline-none focus:border-red-600"
                          />
                        ) : (
                          <p className="text-[10px] font-mono uppercase text-neutral-300 border-b border-neutral-800 pb-1">
                            {city || "---"}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[8px] text-neutral-500 uppercase font-mono mb-1">
                          Province_Region
                        </p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            className="w-full bg-black border border-neutral-700 text-white p-1 text-xs font-mono uppercase outline-none focus:border-red-600"
                          />
                        ) : (
                          <p className="text-[10px] font-mono uppercase text-neutral-300 border-b border-neutral-800 pb-1">
                            {province || "---"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      isEditing ? handleUpdateProfile() : setIsEditing(true)
                    }
                    disabled={isSaving}
                    className="shrink-0 text-[10px] border border-neutral-700 px-3 py-1 hover:border-red-600 hover:text-red-600 transition-colors uppercase font-mono ml-4"
                  >
                    {isSaving
                      ? "SYNCING..."
                      : isEditing
                        ? "[ SAVE_DATA ]"
                        : "[ EDIT_FILE ]"}
                  </button>
                </div>
              </div>
            </section>
          )}
        </AnimatePresence>
      </main>

      {/* 03. RIGHT PANEL */}
      <aside className="hidden xl:flex w-72 border-l border-neutral-900 bg-black/30 p-6 flex-col gap-8 shrink-0">
        <div className="space-y-6">
          <div className="border border-neutral-800 p-4 bg-black/40 relative">
            <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest mb-1">
              Local_Time_Sync
            </p>
            <p className="text-2xl font-mono font-bold text-white tracking-tighter">
              {time.toLocaleTimeString([], { hour12: false })}
            </p>
            <p className="text-[8px] font-mono text-red-600/60 mt-1 uppercase italic">
              Total_Ops_Logged: {orders.length}
            </p>
          </div>
          {/* ... Live System Logs & Threat Level ... */}
        </div>
      </aside>
    </div>
  );
}
