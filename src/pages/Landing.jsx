import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function Landing({ onEnter }) {
  const rows = [1, 2, 3, 4, 5, 6];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center cursor-none">
      {/* 1. TACTICAL CROSSHAIR CURSOR */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-red-600 rounded-full pointer-events-none z-[9999] flex items-center justify-center"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="absolute w-[2px] h-full bg-red-600/30" />
        <div className="absolute w-full h-[2px] bg-red-600/30" />
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_#ff0000]" />
      </motion.div>

      {/* 2. HUD TOP TEXT (Red Terminal Style) */}
      <div className="absolute top-8 flex flex-col items-center justify-center opacity-40 z-50 pointer-events-none w-full">
        <div className="text-red-500 font-mono text-[10px] uppercase tracking-[0.4em] text-center whitespace-nowrap px-4">
          [ AUTH_LEVEL: COMMANDER ] — [ SYSTEM_REBOOT: PENDING ] — [ ENCRYPTION:
          ACTIVE ]
        </div>
      </div>

      {/* 3. BACKGROUND ANIMATION (Red/Black Contrast) */}
      <div className="absolute inset-0 z-0 opacity-[0.08] select-none skew-y-[-5deg] pointer-events-none">
        {rows.map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: i % 2 === 0 ? "0%" : "-50%" }}
            animate={{ x: i % 2 === 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className={`text-[15vw] font-black whitespace-nowrap leading-none tracking-tighter uppercase ${
              i % 2 === 0 ? "text-white" : "text-red-600"
            }`}
          >
            METAGEAR TACTICAL LOADOUT SYSTEM ONLINE METAGEAR
          </motion.div>
        ))}
      </div>

      {/* 4. MAIN ALIGNMENT CONTAINER */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* LOGO BOX */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          {/* Intense Red Background Glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 bg-red-600 blur-[100px] rounded-full"
          />

          <div className="relative bg-white/5 backdrop-blur-sm p-8 rounded-3xl border-2 border-red-600/30 skew-x-[-10deg]">
            <img
              src="/logoo.png"
              className="relative w-[50vw] md:w-80 h-auto z-20 object-contain drop-shadow-[0_0_50px_rgba(255,0,0,0.4)] skew-x-[10deg]"
              alt="MetaGear Logo"
            />
          </div>
        </motion.div>

        {/* 5. TEXT & BUTTON (Redesigned) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center -mt-4 md:-mt-8 z-30"
        >
          <div className="text-center mb-8">
            <p className="text-red-500 font-mono text-[10px] tracking-[0.8em] uppercase mb-2 animate-pulse">
              {">>"} PROTOCOL_771_READY {"<<"}
            </p>
            <h2 className="text-white font-black italic text-5xl md:text-8xl tracking-tighter uppercase leading-none">
              ENTER <span className="text-red-600">SYSTEM</span>
            </h2>
          </div>

          <button
            onClick={onEnter}
            className="group relative px-20 py-5 overflow-hidden rounded-lg transition-all duration-300 active:scale-95 skew-x-[-12deg]"
          >
            {/* Red Button Base */}
            <div className="absolute inset-0 bg-red-600 group-hover:bg-white transition-colors duration-300 shadow-[0_0_20px_#ff0000]" />

            {/* Scanning Light Effect */}
            <motion.div
              animate={{ x: ["-150%", "150%"] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-white/20 skew-x-20"
            />

            <span className="relative text-black font-black uppercase tracking-[0.6em] text-[11px] skew-x-[12deg]">
              Initialize_Loadout
            </span>
          </button>
        </motion.div>
      </div>

      {/* 6. CORNER DETAILS (Extra Tactical Feel) */}
      <div className="absolute bottom-6 left-6 text-red-600/30 font-mono text-[8px] uppercase tracking-widest leading-loose">
        SECURE_CONNECTION: TRACE_ENABLED <br />
        HARDWARE_ACCELERATION: STABLE
      </div>
      <div className="absolute bottom-6 right-6 text-red-600/30 font-mono text-[8px] uppercase tracking-widest text-right">
        v.3.2.0-STABLE <br />© 2026 METAGEAR_INTEL
      </div>
    </section>
  );
}
