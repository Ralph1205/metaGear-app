import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "../supabase";

export default function Checkout({ cartItems, setPage, setCart }) {
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    postalCode: "",
    region: "METRO_MANILA",
  });

  const subtotal = (cartItems || []).reduce(
    (acc, item) => acc + (item.price || 0),
    0,
  );
  const shippingFee = subtotal > 50000 ? 0 : 250;
  const tax = subtotal * 0.12;
  const totalAmount = subtotal + shippingFee + tax;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) return;
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("AGENT_UNAUTHORIZED");

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          { user_id: user.id, total_price: totalAmount, status: "pending" },
        ])
        .select();

      if (orderError) throw orderError;
      const newOrderId = orderData[0].id;

      const itemMap = cartItems.reduce((acc, item) => {
        const id = item.id || item.product_id;
        if (!acc[id])
          acc[id] = { order_id: newOrderId, product_id: id, quantity: 0 };
        acc[id].quantity += 1;
        return acc;
      }, {});

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(Object.values(itemMap));

      if (itemsError) throw new Error("MANIFEST_SYNC_FAILED");

      setOrderId(newOrderId);
      setShowReceipt(true);
    } catch (err) {
      alert(`DEPLOYMENT_FAILURE: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-12 relative font-sans overflow-hidden">
      {/* TACTICAL BACKGROUND OVERLAY */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <motion.div
          animate={{ y: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-16 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            className="absolute -top-4 left-0 h-[1px] bg-red-600/50 shadow-[0_0_10px_red]"
          />
          <h2 className="text-7xl font-[1000] uppercase italic tracking-tighter">
            LOGISTICS<span className="text-red-600 animate-pulse">_</span>DEPLOY
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[10px] font-mono text-red-500 tracking-[0.5em] uppercase">
              Status: Awaiting_Manifest_Validation
            </span>
            <div className="h-[1px] w-24 bg-red-600 animate-bounce" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <form onSubmit={handlePlaceOrder} className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-5 bg-red-600" />
                <h3 className="text-white font-black uppercase text-sm tracking-widest">
                  01. Agent_Credentials
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["fullName", "phoneNumber"].map((field) => (
                  <div key={field} className="relative group">
                    <input
                      required
                      name={field}
                      placeholder={field
                        .replace(/([A-Z])/g, " $1")
                        .toUpperCase()}
                      onChange={handleInputChange}
                      className="w-full bg-neutral-900/30 border-b border-neutral-800 p-4 outline-none focus:border-red-600 transition-all focus:bg-neutral-800/50 uppercase font-bold text-sm"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-red-600 group-focus-within:w-full transition-all duration-500" />
                  </div>
                ))}
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="ENCRYPTED_EMAIL_ADDRESS"
                  onChange={handleInputChange}
                  className="col-span-2 bg-neutral-900/30 border-b border-neutral-800 p-4 outline-none focus:border-red-600 transition-all uppercase font-bold text-sm"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="w-1.5 h-5 bg-red-600" />
                <h3 className="text-white font-black uppercase text-sm tracking-widest">
                  02. Drop_Zone_Coords
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  name="address"
                  placeholder="STREET_ADDRESS / HQ_LOCATION"
                  onChange={handleInputChange}
                  className="col-span-2 bg-neutral-900/30 border-b border-neutral-800 p-4 outline-none focus:border-red-600 transition-all uppercase font-bold text-sm"
                />
                <input
                  required
                  name="postalCode"
                  placeholder="POST_CODE"
                  onChange={handleInputChange}
                  className="bg-neutral-900/30 border-b border-neutral-800 p-4 outline-none focus:border-red-600 transition-all uppercase font-bold text-sm"
                />
                <select
                  name="region"
                  onChange={handleInputChange}
                  className="bg-neutral-900/30 border-b border-neutral-800 p-4 outline-none focus:border-red-600 uppercase font-black text-sm appearance-none cursor-pointer hover:bg-neutral-800"
                >
                  {["METRO_MANILA", "LUZON", "VISAYAS", "MINDANAO"].map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-5 bg-red-600" />
                <h3 className="text-white font-black uppercase text-sm tracking-widest">
                  03. Transfer_Protocol
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["COD", "GCASH"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`relative p-5 border font-[1000] uppercase italic tracking-tighter transition-all group overflow-hidden ${
                      paymentMethod === method
                        ? method === "COD"
                          ? "border-red-600 bg-red-600 text-black"
                          : "border-blue-600 bg-blue-600 text-white"
                        : "border-neutral-800 text-neutral-500 hover:border-neutral-700"
                    }`}
                  >
                    <span className="relative z-10 text-xs">
                      {method === "COD" ? "CASH_ON_DROP" : "GCASH_OVERLINK"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-8 bg-white text-black font-[1000] uppercase italic text-2xl group overflow-hidden transition-all disabled:opacity-50"
              style={{
                clipPath:
                  "polygon(4% 0, 100% 0, 100% 70%, 96% 100%, 0 100%, 0 30%)",
              }}
            >
              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 group-hover:text-white transition-colors">
                {loading ? "DATA_SYNCING..." : "CONFIRM_DEPLOYMENT"}
              </span>
            </button>
          </form>

          {/* SIDEBAR ASSET MANIFEST */}
          <div className="relative group h-fit">
            <div className="absolute -inset-[1px] bg-red-600/20 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/40 p-8 border border-red-600/30 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[9px] font-mono text-red-600 uppercase tracking-[0.4em] font-black">
                  // Asset_Manifest_v4.0
                </h3>
                <div className="flex gap-1">
                  {[...Array(2)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, delay: i * 0.2 }}
                      className="w-1 h-1 bg-red-600"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-5 mb-10 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                {(cartItems || []).map((item, i) => (
                  <div key={i} className="flex gap-5 items-center group/item">
                    <div className="w-14 h-14 bg-black border border-neutral-800 relative overflow-hidden shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale opacity-70 group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all duration-500"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-black text-xs uppercase tracking-tighter mb-0.5 group-hover/item:text-red-500 transition-colors">
                        {item.name}
                      </p>
                      <p className="font-mono text-[8px] text-neutral-500">
                        UID: {item.id || item.product_id}
                      </p>
                    </div>
                    <p className="font-mono text-xs font-black text-red-600">
                      ₱{item.price?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 border-t border-red-600/20 pt-6 font-mono text-[10px]">
                <div className="flex justify-between text-neutral-500">
                  <span>GROSS_VALUE</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>LOGISTICS_FEE</span>
                  <span>{shippingFee === 0 ? "FREE" : `₱${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>GOVT_TAX_VAT</span>
                  <span>₱{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-3xl font-[1000] italic text-white mt-5 pt-5 border-t border-neutral-800">
                  <span className="text-red-600">TOTAL</span>
                  <span>₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL RECEIPT MODAL */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              className="bg-neutral-900 border border-red-600/50 p-[1px] w-full max-w-xl shadow-[0_0_50px_rgba(220,38,38,0.2)]"
            >
              <div className="border border-neutral-800 bg-[#050505] relative overflow-hidden">
                {/* TACTICAL DECORATIONS */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
                <div className="absolute top-4 right-4 flex gap-1">
                  <div className="w-1 h-1 bg-red-600 animate-pulse" />
                  <div className="w-8 h-[1px] bg-red-600/30 self-center" />
                </div>

                <div className="p-10">
                  {/* HEADER */}
                  <div className="mb-10 flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-[1000] uppercase text-5xl tracking-tighter italic leading-none">
                        ORDER
                        <br />
                        <span className="text-red-600">CONFIRMED</span>
                      </h3>
                      <p className="text-neutral-600 font-mono text-[9px] mt-3 tracking-[0.2em]">
                        MANIFEST_ID: {orderId?.toString().slice(0, 12)}...
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-[10px] text-red-500/80">
                        AUTHENTICATED_AGENT
                      </p>
                      <p className="text-xs font-bold text-white uppercase">
                        {formData.fullName.split(" ")[0]}
                      </p>
                    </div>
                  </div>

                  {/* INTEL GRID */}
                  <div className="grid grid-cols-2 gap-0 mb-10 border border-neutral-800/50">
                    <div className="p-6 border-r border-b border-neutral-800/50 space-y-1">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                        Protocol
                      </p>
                      <p className="text-sm font-black text-white italic">
                        {paymentMethod === "COD"
                          ? "CASH_ON_DROP"
                          : "GCASH_LINK"}
                      </p>
                    </div>
                    <div className="p-6 border-b border-neutral-800/50 space-y-1">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                        Region
                      </p>
                      <p className="text-sm font-black text-white italic">
                        {formData.region.replace("_", " ")}
                      </p>
                    </div>
                    <div className="p-6 col-span-2 space-y-1 bg-neutral-900/20">
                      <p className="text-[9px] font-mono text-red-600 uppercase tracking-widest font-bold">
                        Extraction point
                      </p>
                      <p className="text-[11px] font-medium text-neutral-300 uppercase leading-tight">
                        {formData.address}
                      </p>
                    </div>
                  </div>

                  {/* PRICE AREA */}
                  <div className="flex justify-between items-center mb-10 px-2">
                    <div className="font-mono">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">
                        Settlement_Total
                      </p>
                      <p className="text-[10px] text-red-600/50 uppercase italic">
                        Vat_Included_12%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-6xl font-[1000] italic text-white tracking-tighter leading-none">
                        <span className="text-2xl align-top mr-1 text-red-600">
                          ₱
                        </span>
                        {totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <button
                    onClick={() => {
                      setCart([]);
                      setPage("home");
                    }}
                    className="relative w-full py-6 bg-red-600 group overflow-hidden transition-all duration-300 hover:bg-white"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% 75%, 95% 100%, 0 100%)",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-black uppercase italic text-sm tracking-[0.3em] group-hover:text-black transition-colors">
                        Return to Base_Station
                      </span>
                    </div>
                    {/* Button Glitch Effect Overlay */}
                    <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                  </button>

                  <p className="text-center mt-6 text-[8px] font-mono text-neutral-700 uppercase tracking-widest">
                    Secured_By_MetaGear_Systems_v4.0
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
