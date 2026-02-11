import { motion, AnimatePresence } from "framer-motion";

export default function Cart({ cartItems, setPage, setCart }) {
  const groupedItems = cartItems.reduce((acc, item) => {
    const existing = acc.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      acc.push({ ...item, quantity: 1 });
    }
    return acc;
  }, []);

  const total = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  // --- NEW LOGIC FOR QUANTITY CONTROL ---
  const addItem = (itemToAdd) => {
    setCart([...cartItems, { ...itemToAdd }]);
  };

  const removeItemOne = (id) => {
    const index = cartItems.findIndex((item) => item.id === id);
    if (index !== -1) {
      const newCart = [...cartItems];
      newCart.splice(index, 1);
      setCart(newCart);
    }
  };

  const removeItemCompletely = (id) => {
    setCart(cartItems.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full h-screen text-white bg-black selection:bg-red-600 relative overflow-hidden flex flex-col">
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]" />
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-red-900/10 via-transparent to-transparent" />

      {/* --- INNER CONTENT --- */}
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col p-6 md:p-12 relative z-10 overflow-hidden">
        {/* --- FIXED HEADER --- */}
        <header className="flex justify-between items-end mb-8 border-b border-red-600/30 pb-8 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[2px] w-8 bg-red-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">
                System_Inventory // v2.04
              </span>
            </div>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">
              Current_Loadout<span className="text-red-600">.</span>
            </h2>
          </motion.div>

          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => setPage("home")}
            className="group flex flex-col items-end pointer-events-auto"
          >
            <span className="text-[10px] font-mono text-neutral-500 group-hover:text-red-600 transition-colors uppercase tracking-widest">
              Return_To_Depot
            </span>
            <span className="text-2xl font-black text-red-600 group-hover:text-white transition-colors">
              ←
            </span>
          </motion.button>
        </header>

        {groupedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 border border-neutral-800 bg-neutral-900/20 backdrop-blur-md relative"
            style={{
              clipPath:
                "polygon(5% 0, 100% 0, 100% 90%, 95% 100%, 0 100%, 0 10%)",
            }}
          >
            <p className="text-neutral-500 font-mono uppercase tracking-[0.3em] text-sm italic">
              [ No active gear detected in loadout ]
            </p>
            <button
              onClick={() => setPage("home")}
              className="mt-8 bg-white text-black px-10 py-4 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl"
            >
              Access_Depot
            </button>
          </motion.div>
        ) : (
          /* --- SCROLLABLE LIST AREA --- */
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 invisible-scrollbar">
            <AnimatePresence mode="popLayout">
              {groupedItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="group relative flex items-center gap-6 bg-neutral-900/40 border border-neutral-800 p-5 hover:bg-neutral-800/40 hover:border-red-600/50 transition-all shrink-0"
                  style={{
                    clipPath:
                      "polygon(0 0, 98% 0, 100% 15%, 100% 100%, 2% 100%, 0 85%)",
                  }}
                >
                  <div className="relative w-28 h-28 bg-black border border-neutral-800 overflow-hidden shrink-0">
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/20 to-transparent h-1/2 w-full -translate-y-full group-hover:animate-[scan_2s_linear_infinite]" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-2xl uppercase italic tracking-tight">
                      {item.name}
                    </h3>

                    {/* --- TACTICAL QUANTITY SELECTOR (Matches Pic 2) --- */}
                    <div className="mt-3 flex items-center border border-neutral-800 bg-black/50 w-fit">
                      <button
                        onClick={() => removeItemOne(item.id)}
                        className="px-4 py-2 text-neutral-500 hover:text-red-500 transition-colors font-bold border-r border-neutral-800"
                      >
                        —
                      </button>
                      <div className="px-6 py-2 flex flex-col items-center min-w-[80px]">
                        <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter leading-none mb-1">
                          Units_Selected
                        </span>
                        <span className="text-xl font-black font-mono">
                          {item.quantity.toString().padStart(2, "0")}
                        </span>
                      </div>
                      <button
                        onClick={() => addItem(item)}
                        className="px-4 py-2 text-neutral-500 hover:text-red-500 transition-colors font-bold border-l border-neutral-800"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end justify-between self-stretch py-1">
                    <p className="font-black text-2xl tracking-tighter">
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItemCompletely(item.id)}
                      className="text-[9px] uppercase font-black text-neutral-500 hover:text-white transition-colors"
                    >
                      [ Remove_Unit ]
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* --- FIXED FOOTER --- */}
        <motion.div
          layout
          className="mt-8 bg-neutral-900 border-l-8 border-red-600 p-8 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0 relative overflow-hidden"
        >
          <div className="relative">
            <p className="text-red-500 font-mono text-[10px] uppercase tracking-[0.4em] mb-1 font-black">
              TOTAL_CARGO_VALUE
            </p>
            <h3 className="text-6xl font-black tracking-tighter italic">
              ₱{total.toLocaleString()}
            </h3>
          </div>

          <div className="flex gap-4 w-full md:w-auto relative z-10">
            <button
              onClick={() => setCart([])}
              className="flex-1 md:flex-none px-8 py-4 border border-neutral-700 font-black uppercase text-[10px] skew-x-[-12deg] hover:bg-white hover:text-black transition-all"
            >
              Purge_All
            </button>
            <button
              onClick={() => setPage("checkout")}
              className="flex-1 md:flex-none px-12 py-4 bg-red-600 text-white font-black uppercase text-[10px] skew-x-[-12deg] hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)]"
            >
              Deploy_Loadout
            </button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .invisible-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .invisible-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes scan {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(200%);
          }
        }
      `}</style>
    </div>
  );
}
