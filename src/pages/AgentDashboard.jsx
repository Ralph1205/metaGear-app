import React, { useState, useEffect, useRef } from "react";
import supabase from "../supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentDashboard({
  session,
  activeTab,
  setActiveTab,
  addToCart,
}) {
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const fileInputRef = useRef(null);

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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const agentName =
    newName || session?.user?.email?.split("@")[0] || "Unknown_Agent";

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function getProfileImage() {
      const storedPath = session?.user?.user_metadata?.avatar_path;
      const googlePic =
        session?.user?.user_metadata?.picture ||
        session?.user?.user_metadata?.avatar_url;

      if (storedPath) {
        const { data, error } = await supabase.storage
          .from("profiles")
          .createSignedUrl(storedPath, 3600);
        if (!error) setAvatarUrl(data.signedUrl);
      } else if (googlePic) {
        setAvatarUrl(googlePic);
      }
    }
    if (session) getProfileImage();
  }, [session]);

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

    async function fetchWishlist() {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`*, products(*)`)
        .eq("user_id", session?.user?.id);

      if (!error) setWishlist(data);
    }

    if (session) {
      fetchUserOrders();
      fetchWishlist();
    }
  }, [session]);

  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm("PERMANENTLY_ERASE_ORDER_MANIFEST?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (!error) {
      setOrders(orders.filter((order) => order.id !== orderId));
    } else {
      alert("ERASE_FAILURE: " + error.message);
    }
  };

  const handleRemoveFromWishlist = async (id) => {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (!error) setWishlist(wishlist.filter((item) => item.id !== id));
  };

  const handleMoveToCart = async (item) => {
    if (!item.products || item.products.stock <= 0) {
      alert("ACCESS_DENIED: TARGET_OUT_OF_STOCK. DEPLOYMENT_ABORTED.");
      return;
    }

    if (addToCart) {
      addToCart(item.products);
    }

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("id", item.id);

    if (!error) {
      setWishlist(wishlist.filter((w) => w.id !== item.id));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    const filePath = `${session.user.id}/${Date.now()}_avatar`;
    try {
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_path: filePath },
      });
      if (updateError) throw updateError;
      const { data } = await supabase.storage
        .from("profiles")
        .createSignedUrl(filePath, 3600);
      setAvatarUrl(data.signedUrl);
      alert("SECURE_UPLINK_ESTABLISHED");
    } catch (error) {
      alert("ACCESS_DENIED: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: newName, street, city, province },
    });
    if (error) alert("SYNC_ERROR: " + error.message);
    else {
      setIsEditing(false);
      window.location.reload();
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row pt-20 font-sans overflow-hidden">
      <aside className="w-full md:w-60 border-r border-neutral-900 bg-black/50 p-6 flex flex-col gap-8 shrink-0">
        <div className="space-y-1">
          <p className="text-red-600 font-mono text-[8px] uppercase tracking-[0.4em] animate-pulse">
            Status: Active_Duty
          </p>
          <h2 className="text-2xl font-[1000] italic tracking-tighter uppercase leading-tight">
            Welcome, <br />
            <span className="text-red-600">{agentName.split(" ")[0]}</span>
          </h2>
          <p className="text-neutral-600 font-mono text-[8px] truncate opacity-60">
            {session?.user?.email}
          </p>
        </div>
        <nav className="flex flex-col gap-2">
          {[
            { id: "manifests", label: "Intel_Ops" },
            { id: "wishlist", label: "Target_List" },
            { id: "profile", label: "Personnel_File" },
          ].map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeTab === tab.id
                  ? "bg-red-600 border-red-600 text-black"
                  : "border-neutral-800 text-neutral-500 hover:border-red-600"
              }`}
            >
              {tab.label}
              <span className="opacity-50 text-[8px]">[0{idx + 1}]</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "manifests" ? (
            <motion.section
              key="manifests"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter border-b border-red-600 pb-2 inline-block">
                Order_Manifests
              </h3>
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-neutral-900/20 border border-neutral-800 p-6 hover:border-red-600/50 transition-all relative group cursor-pointer"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrder(order.id);
                      }}
                      className="absolute top-4 right-4 text-[9px] font-bold text-neutral-700 hover:text-red-600 transition-colors uppercase font-mono"
                    >
                      [ DISCONNECT_LOG ]
                    </button>

                    <div
                      onClick={() => setSelectedOrder(order)}
                      className="flex flex-col md:flex-row justify-between gap-4 mb-4 border-b border-neutral-800/50 pb-4"
                    >
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono text-red-600 uppercase tracking-widest">
                          Manifest_ID: {order.id.toString().slice(0, 8)}
                        </p>
                        <p className="text-[9px] font-mono text-red-500 font-bold">
                          T_STAMP:{" "}
                          {new Date(order.created_at).toLocaleDateString()} //{" "}
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                          _HRS
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-mono text-neutral-500 uppercase">
                          Settlement
                        </p>
                        <p className="text-2xl font-[1000] italic text-white">
                          ₱{order.total_price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {order.order_items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center border-l border-red-600 pl-4 py-1"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.products?.image_url}
                              className="w-10 h-10 object-cover border border-neutral-800"
                              alt="asset"
                            />
                            <p className="text-[10px] font-black uppercase tracking-tight text-neutral-300">
                              {item.products?.name}
                            </p>
                          </div>
                          <p className="text-[10px] font-mono text-red-600 font-bold">
                            [{item.quantity}X]
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-right">
                      <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">
                        [ VIEW_DETAILS ]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          ) : activeTab === "wishlist" ? (
            <motion.section
              key="wishlist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter border-b border-red-600 pb-2 inline-block">
                Target_List
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlist.length > 0 ? (
                  wishlist.map((item) => {
                    const isOutOfStock =
                      !item.products || item.products.stock <= 0;
                    return (
                      <div
                        key={item.id}
                        className="bg-neutral-900/20 border border-neutral-800 p-4 flex gap-4 items-center group"
                      >
                        <img
                          src={item.products?.image_url}
                          alt=""
                          className={`w-16 h-16 object-cover border border-neutral-800 ${isOutOfStock ? "grayscale" : ""}`}
                        />
                        <div className="flex-1">
                          <h4
                            className={`text-xs font-black uppercase tracking-tighter ${isOutOfStock ? "text-neutral-600" : ""}`}
                          >
                            {item.products?.name}
                          </h4>
                          <p className="text-red-600 font-mono text-[10px]">
                            {isOutOfStock
                              ? "OUT_OF_STOCK"
                              : `₱${item.products?.price?.toLocaleString()}`}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 text-right">
                          <button
                            onClick={() => handleMoveToCart(item)}
                            disabled={isOutOfStock}
                            className={`text-[8px] font-mono px-2 py-1 uppercase font-bold transition-colors ${
                              isOutOfStock
                                ? "bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700"
                                : "bg-white text-black hover:bg-red-600 hover:text-white"
                            }`}
                          >
                            {isOutOfStock
                              ? "[ UNAVAILABLE ]"
                              : "[ DEPLOY_TO_CART ]"}
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="text-[8px] font-mono text-neutral-600 hover:text-red-600 border border-neutral-800 px-2 py-1 uppercase"
                          >
                            [ ELIMINATE ]
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-neutral-600 font-mono text-xs italic">
                    NO_TARGETS_ACQUIRED
                  </p>
                )}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto"
            >
              <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter border-b border-red-600 pb-2 mb-10">
                Personnel_File
              </h3>
              <div className="bg-neutral-900/10 border border-neutral-800 p-10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="relative group shrink-0">
                    <div className="w-32 h-40 bg-neutral-900 border border-neutral-700 overflow-hidden relative shadow-2xl">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Agent"
                          className="w-full h-full object-cover transition-all"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-700 font-mono text-[8px] text-center p-4 italic">
                          ENCRYPTED_ID_IMAGE
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 left-0 w-full bg-red-600 text-[8px] font-black py-1 uppercase tracking-tighter"
                      >
                        Upload_New
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                  <div className="flex-1 space-y-8 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1 border-l-2 border-red-600 pl-4">
                        <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                          Legal_Full_Name
                        </p>
                        {isEditing ? (
                          <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-black border border-neutral-700 p-2 text-sm outline-none focus:border-red-600"
                          />
                        ) : (
                          <p className="text-xl font-black uppercase italic">
                            {agentName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1 border-l-2 border-neutral-800 pl-4">
                        <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                          Clearance_Level
                        </p>
                        <p className="text-xl font-black uppercase italic text-red-600">
                          Level_04 / Operative
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-neutral-800/50">
                      {[
                        {
                          label: "Deployment_Sector",
                          val: street,
                          set: setStreet,
                          id: "S-1",
                        },
                        {
                          label: "City_District",
                          val: city,
                          set: setCity,
                          id: "C-4",
                        },
                        {
                          label: "Regional_HQ",
                          val: province,
                          set: setProvince,
                          id: "R-9",
                        },
                      ].map((field) => (
                        <div key={field.label} className="space-y-2">
                          <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-tighter italic">
                            {field.id} // {field.label}
                          </p>
                          {isEditing ? (
                            <input
                              value={field.val}
                              onChange={(e) => field.set(e.target.value)}
                              className="w-full bg-black border border-neutral-700 p-2 text-xs font-mono outline-none"
                            />
                          ) : (
                            <p className="text-xs font-mono text-neutral-200 border-b border-neutral-900 pb-1">
                              {field.val || "NOT_ASSIGNED"}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-8">
                      <button
                        onClick={() =>
                          isEditing ? handleUpdateProfile() : setIsEditing(true)
                        }
                        disabled={isSaving}
                        className="bg-white text-black px-8 py-3 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                      >
                        {isSaving
                          ? "SYNCING..."
                          : isEditing
                            ? "SAVE_PROFILE_DATA"
                            : "UPDATE_PERSONNEL_FILE"}
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => setIsEditing(false)}
                          className="border border-neutral-800 px-8 py-3 text-[10px] font-black uppercase text-neutral-500 hover:text-white"
                        >
                          CANCEL
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#0a0a0a] border border-red-600 p-10 w-full max-w-lg font-mono relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="absolute top-4 right-6 text-neutral-600 hover:text-white cursor-pointer"
                onClick={() => setSelectedOrder(null)}
              >
                [ CLOSE ]
              </div>
              <h4 className="text-red-600 text-2xl font-black italic mb-8 underline decoration-red-600/30 underline-offset-8">
                MANIFEST_RECEIPT
              </h4>
              <div className="space-y-4 mb-10">
                {selectedOrder.order_items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs border-b border-neutral-900 pb-2"
                  >
                    <span className="text-neutral-400 uppercase">
                      {item.products?.name} (x{item.quantity})
                    </span>
                    <span>
                      ₱{(item.products?.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-2xl font-black italic">
                <span className="text-red-600">TOTAL</span>
                <span>₱{selectedOrder.total_price?.toLocaleString()}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
