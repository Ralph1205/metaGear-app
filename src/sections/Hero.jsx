import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Added setPage prop to the component
export default function Hero({ setPage }) {
  const [index, setIndex] = useState(0);
  const images = ["/heroo.png", "/m.png", "/m1.jpg", "/m2.jpg"];

  const handleMouseMove = (e) => {
    const sectionWidth = window.innerWidth / images.length;
    const newIndex = Math.floor(e.clientX / sectionWidth);
    if (newIndex !== index && newIndex < images.length) {
      setIndex(newIndex);
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative h-[85vh] w-full overflow-hidden bg-[#020202]"
    >
      <style>
        {`
          @keyframes scan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          /* Added Glitch Keyframes */
          @keyframes glitch {
            0% { transform: translate(0); text-shadow: none; }
            20% { transform: translate(-2px, 2px); text-shadow: 2px 0 red; }
            40% { transform: translate(-2px, -2px); text-shadow: -2px 0 blue; }
            60% { transform: translate(2px, 2px); text-shadow: 2px 0 red; }
            80% { transform: translate(2px, -2px); text-shadow: -2px 0 blue; }
            100% { transform: translate(0); text-shadow: none; }
          }
          .glitch-active {
            animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) both infinite;
          }
        `}
      </style>

      {/* --- FIERCE SIDE DECORATIONS (Unchanged) --- */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute left-4 top-1/4 h-1/2 w-48 flex flex-col justify-between">
          <div className="border-t-2 border-l-2 border-red-600 w-8 h-8 opacity-60" />
          <div className="font-mono text-[9px] text-red-500/40 space-y-2 uppercase tracking-tighter">
            <p className="animate-pulse">▶ SCANNING_BIO_SIGNATURES...</p>
            <p className="text-white/20">LOC: 14.5995° N, 120.9842° E</p>
            <div className="flex gap-1">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-[2px] bg-red-600/30"
                />
              ))}
            </div>
          </div>
          <div className="border-b-2 border-l-2 border-red-600 w-8 h-8 opacity-60" />
        </div>

        <div className="absolute right-4 top-1/4 h-1/2 w-48 flex flex-col justify-between items-end">
          <div className="border-t-2 border-r-2 border-red-600 w-8 h-8 opacity-60" />
          <div className="flex flex-col items-end gap-3 pr-2">
            <div className="text-right">
              <span className="text-[8px] text-red-600 block font-bold mb-1">
                PWR_CELL_STABILITY
              </span>
              <div className="w-24 h-1 bg-white/5 overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full bg-red-600 shadow-[0_0_10px_red]"
                />
              </div>
            </div>
            <p className="text-[10px] font-black text-red-600 italic">
              METAGEAR // AUTH_REQUIRED
            </p>
          </div>
          <div className="border-b-2 border-r-2 border-red-600 w-8 h-8 opacity-60" />
        </div>
      </div>

      {/* --- ORIGINAL IMAGE (Size Unchanged) --- */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-contain object-bottom"
            alt="Hardware Display"
          />
        </AnimatePresence>
      </div>

      {/* --- CONTENT LAYER (Glitch Added to Heading) --- */}
      <div className="relative z-20 max-w-7xl mx-auto h-full flex flex-col justify-center items-end px-12 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative mb-6 pointer-events-auto"
        >
          <div className="absolute -inset-1 bg-red-600 blur-[2px] opacity-30 animate-pulse" />
          <span className="relative inline-block bg-red-600 text-white text-[10px] font-black px-4 py-1.5 -skew-x-12 border-r-4 border-white">
            NEXT-GEN HARDWARE // V.03
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-right pointer-events-auto mb-6"
        >
          <h1
            key={index}
            className="text-white text-4xl md:text-6xl font-[1000] uppercase italic leading-[0.95] tracking-[-0.05em] drop-shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
          >
            <motion.span
              animate={{ x: [0, -2, 2, 0], opacity: [1, 0.8, 1] }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              JOIN THE
            </motion.span>
            <span className="text-red-600 inline-block mt-2 relative">
              <motion.span
                animate={{ x: [0, 2, -2, 0] }}
                transition={{ duration: 0.2 }}
              >
                METAGEAR
              </motion.span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-2 right-0 h-1 bg-red-600"
              />
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mb-10 pointer-events-auto"
        >
          <p className="text-white text-[11px] md:text-xs max-w-xs font-bold leading-relaxed pr-6 text-right uppercase tracking-wider">
            Establish dominance in the gear universe. <br />
            Customize. Upgrade. Deploy. <br />
            <span className="text-red-500/80 font-mono text-[9px] mt-2 block tracking-widest animate-pulse">
              {`>> STATUS: READY_FOR_DEPLOYMENT`}
            </span>
          </p>
          <div className="absolute right-0 top-0 h-full w-[4px] bg-red-600 shadow-[0_0_10px_#dc2626]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="pointer-events-auto"
        >
          <button
            // REDIRECT LOGIC ADDED HERE
            onClick={() => setPage("home")}
            className="group relative bg-white text-black px-14 py-4 font-[1000] uppercase text-[12px] tracking-[0.4em] transition-all hover:bg-red-600 hover:text-white active:scale-95 overflow-hidden"
            style={{
              clipPath:
                "polygon(12% 0, 100% 0, 100% 70%, 88% 100%, 0 100%, 0 30%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[scan_1s_infinite]" />
            View Products
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 shadow-[0_-4px_10px_rgba(220,38,38,0.5)] z-30" />
    </section>
  );
}
