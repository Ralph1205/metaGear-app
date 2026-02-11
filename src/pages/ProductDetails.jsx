import { useState, useEffect } from "react"; // Added useEffect
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetails({
  product,
  addToCart,
  setPage,
  session,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // --- LOCAL STORAGE REVIEW LOGIC ---
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Initialize state from LocalStorage or use defaults if empty
  const [reviews, setReviews] = useState(() => {
    if (typeof window !== "undefined" && product?.id) {
      const savedReviews = localStorage.getItem(`reviews_${product.id}`);
      return savedReviews
        ? JSON.parse(savedReviews)
        : [
            {
              user: "GHOST_REAPER",
              date: "2026.02.10",
              text: "Zero latency. The build quality feels like it could survive a drop from orbit. Essential gear for any high-tier loadout.",
              rating: 5,
            },
            {
              user: "NEON_VULCAN",
              date: "2026.01.28",
              text: "Integration with the MetaGear ecosystem was instantaneous. Expensive, but you get exactly what you pay for.",
              rating: 5,
            },
          ];
    }
    return [];
  });

  // Effect to update LocalStorage whenever the reviews array changes
  useEffect(() => {
    if (product?.id) {
      localStorage.setItem(`reviews_${product.id}`, JSON.stringify(reviews));
    }
  }, [reviews, product?.id]);

  const handleSubmitIntel = () => {
    if (!reviewText.trim()) return;

    const newEntry = {
      user:
        session?.user?.name?.toUpperCase().replace(/\s+/g, "_") ||
        "GHOST_AGENT",
      date: new Date().toISOString().split("T")[0].replace(/-/g, "."),
      text: reviewText,
      rating: userRating,
    };

    setReviews([newEntry, ...reviews]);
    setReviewText("");
    setUserRating(5);
  };

  if (!product) return null;

  const handleQuantity = (type) => {
    if (type === "plus") setQuantity((p) => p + 1);
    if (type === "minus" && quantity > 1) setQuantity((p) => p - 1);
  };

  const handleAddToCart = () => {
    if (!session) {
      addToCart();
      return;
    }
    addToCart(product, quantity);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white overflow-x-hidden">
      {/* --- TOP NAVIGATION --- */}
      <nav className="p-8 max-w-7xl mx-auto flex justify-between items-center">
        <button
          onClick={() => setPage("home")}
          className="group text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-red-600 hover:text-white transition-all"
        >
          <span className="group-hover:-translate-x-2 transition-transform">
            ←
          </span>
          Return_To_Armory
        </button>
        <div className="text-[10px] font-mono text-neutral-600 tracking-widest hidden md:block">
          DEPT: TACTICAL_HARDWARE // AUTH: LVL_0{session ? "1" : "0"}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 py-10">
        {/* LEFT: IMAGE SECTION */}
        <div className="relative">
          <motion.div
            className="relative h-[500px] md:h-[650px] w-full"
            style={{ perspective: "2000px" }}
            animate={{ scale: isZoomed ? 1.05 : 1, zIndex: isZoomed ? 50 : 1 }}
          >
            <div
              className="relative w-full h-full transition-transform duration-700 preserve-3d"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
              onDoubleClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="absolute inset-0 w-full h-full backface-hidden">
                <div className="h-full rounded-3xl overflow-hidden bg-neutral-900 border-2 border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group">
                  <img
                    src={product.displayImage || product.image_url}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isZoomed
                        ? "scale-150 cursor-zoom-out"
                        : "scale-110 grayscale-[0.5] group-hover:grayscale-0 cursor-zoom-in"
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="w-12 h-1 bg-red-600 animate-pulse" />
                    <span className="text-[8px] font-mono text-red-600">
                      LIVE_FEED_04
                    </span>
                  </div>
                  <div className="absolute bottom-6 right-6 bg-red-600 text-white px-4 py-2 skew-x-[-12deg] font-black text-[9px] uppercase tracking-widest shadow-[0_0_20px_#ff0000]">
                    {isZoomed ? "Exit_Scanner" : "Double_Click_To_Scan"}
                  </div>
                </div>
              </div>

              <div
                className="absolute inset-0 w-full h-full backface-hidden"
                style={{ transform: "rotateY(180deg)" }}
              >
                <div className="h-full rounded-3xl bg-neutral-950 border-2 border-red-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(#ff0000_1px,transparent_1px),linear-gradient(90deg,#ff0000_1px,transparent_1px)] bg-[size:20px_20px]" />
                  <div className="relative z-10">
                    <h3 className="text-red-600 font-black text-xl mb-8 border-b-2 border-red-600 pb-4 tracking-tighter uppercase italic">
                      Internal_Schematics_v4.0
                    </h3>
                    <div className="grid grid-cols-2 gap-8 font-mono text-[10px]">
                      <div className="space-y-4">
                        <p className="text-red-500/50 uppercase">
                          Origin: <span className="text-white">Meta_Vault</span>
                        </p>
                        <p className="text-red-500/50 uppercase">
                          Hash:{" "}
                          <span className="text-white">#{product.id}00X</span>
                        </p>
                      </div>
                      <div className="space-y-4">
                        <p className="text-red-500/50 uppercase">
                          Class:{" "}
                          <span className="text-white">Elite_Hardware</span>
                        </p>
                        <p className="text-red-500/50 uppercase">
                          Integrity:{" "}
                          <span className="text-green-400">100%_STABLE</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-12 p-6 bg-red-600/5 border border-red-600/20 rounded-lg">
                      <p className="text-neutral-400 text-xs leading-relaxed italic uppercase tracking-wider">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: PURCHASE SECTION */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1
              className="text-4xl md:text-6xl font-[1000] uppercase italic tracking-tighter leading-[0.8] mb-6 text-white"
              style={{ textShadow: "3px 3px 0px #dc2626" }}
            >
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-red-600 uppercase border border-red-600 px-2">
                Market_Value
              </span>
              <p className="text-5xl font-black text-white italic tracking-tighter">
                ₱{product.price?.toLocaleString()}
              </p>
            </div>
          </motion.div>

          <div className="space-y-6">
            <div className="flex items-center justify-between bg-neutral-900 p-1 border-2 border-neutral-800">
              <button
                onClick={() => handleQuantity("minus")}
                className="w-14 h-14 flex items-center justify-center font-black text-xl text-neutral-500 hover:text-red-600 hover:bg-black transition-all"
              >
                —
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter">
                  Units_Selected
                </span>
                <span className="font-black text-3xl">
                  {quantity.toString().padStart(2, "0")}
                </span>
              </div>
              <button
                onClick={() => handleQuantity("plus")}
                className="w-14 h-14 flex items-center justify-center font-black text-xl text-neutral-500 hover:text-red-600 hover:bg-black transition-all"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="group relative w-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <div className="relative z-10 w-full bg-white text-black py-6 font-[1000] uppercase tracking-[0.3em] text-xs group-hover:text-white transition-colors">
                Add_To_Loadout ({quantity})
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* --- USER REVIEWS SECTION --- */}
      <section className="max-w-7xl mx-auto px-8 py-24 border-t border-neutral-900">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="md:w-1/3">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
              Customer_Intel<span className="text-red-600">.</span>
            </h2>
            <p className="text-neutral-500 text-[10px] uppercase font-mono tracking-widest mb-8">
              Verified_Agent_Feedback // 4.9 AVG_SCORE
            </p>

            <div className="mt-16 p-6 border border-neutral-800 bg-neutral-900/20">
              <h3 className="text-[10px] font-black uppercase text-red-600 mb-6 tracking-widest">
                Transmit_Feedback
              </h3>
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setUserRating(num)}
                    className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold border ${
                      userRating >= num
                        ? "bg-red-600 border-red-600 text-white"
                        : "border-neutral-800 text-neutral-500 hover:border-red-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="INPUT_FEEDBACK_DATA..."
                className="w-full bg-black border border-neutral-800 p-4 text-[10px] font-mono text-white focus:border-red-600 outline-none mb-4 min-h-[100px] uppercase"
              />
              <button
                onClick={handleSubmitIntel}
                className="w-full py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
              >
                Submit_Intel
              </button>
            </div>
          </div>

          <div className="md:w-2/3 space-y-8">
            <AnimatePresence>
              {reviews.map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-8 bg-neutral-900/30 border-l-2 border-red-600 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white tracking-widest uppercase italic">
                      {review.user}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-600">
                      {review.date}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-red-600 skew-x-[-20deg]"
                      />
                    ))}
                  </div>
                  <p className="text-neutral-400 text-xs uppercase tracking-wider leading-relaxed italic">
                    "{review.text}"
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
