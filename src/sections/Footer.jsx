import React, { useState, useEffect } from "react";

export default function Footer() {
  const [time, setTime] = useState("");

  // Real-time clock set to Philippines Time (PHT)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          timeZone: "Asia/Manila",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const footerLinks = {
    Shop: [
      "Graphics Cards",
      "Keyboards",
      "Gaming Mice",
      "Displays",
      "Audio Gear",
    ],
    Support: [
      "Order Tracking",
      "Warranty Claims",
      "Technical Setup",
      "Shipping Policy",
    ],
    Company: ["About MetaGear", "Partnerships", "Careers", "Privacy Policy"],
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#050505] text-white pt-20 pb-8 border-t-2 border-red-600/20 mt-auto relative overflow-hidden">
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-6 gap-12 relative z-10">
        {/* BRAND & SYSTEM INFO SECTION */}
        <div className="md:col-span-3 flex flex-col gap-10">
          <div
            className="flex items-center gap-6 group cursor-pointer w-fit"
            onClick={scrollToTop}
          >
            <img
              src="/logoo.png"
              className="w-20 h-20 object-contain brightness-200 group-hover:scale-110 transition-transform duration-500"
              alt="logo"
            />
            <span className="font-[1000] text-6xl tracking-tighter uppercase italic leading-none">
              Meta<span className="text-red-600">Gear</span>
            </span>
          </div>

          {/* NEW TACTICAL INFO DISPLAY */}
          <div className="flex gap-12 border-l-2 border-white/10 pl-8 py-2">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-mono text-neutral-500 uppercase tracking-widest">
                System_Time
              </span>
              <span className="text-2xl font-mono text-red-600 font-bold tracking-tighter">
                {time || "00:00:00"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-mono text-neutral-500 uppercase tracking-widest">
                Server_Status
              </span>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]" />
                <span className="text-2xl font-mono text-white font-bold tracking-tighter">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LINK COLUMNS */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title} className="flex flex-col gap-8">
            <h4 className="font-black uppercase text-[14px] tracking-[0.4em] text-red-600/80 select-none border-b border-red-600/20 pb-2">
              {title}
            </h4>
            <ul className="flex flex-col gap-4">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                    className="relative text-[14px] font-bold text-neutral-400 hover:text-white transition-colors duration-300 uppercase tracking-widest group block w-fit"
                  >
                    <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 rotate-45" />
                    {link}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* BOTTOM STRIP */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 px-6 md:px-12 relative">
        <div className="text-[12px] font-mono text-neutral-500 uppercase tracking-[0.2em]">
          © 2026 MetaGear <span className="mx-2 text-neutral-800">|</span> All
          Systems Operational
        </div>

        <button
          onClick={scrollToTop}
          className="group flex flex-col items-center gap-3 transition-all active:translate-y-[-4px]"
        >
          <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center group-hover:border-red-600 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all">
            <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-neutral-500 group-hover:border-red-600 rotate-45 translate-y-0.5" />
          </div>
          <span className="text-[10px] font-black text-neutral-500 group-hover:text-red-600 uppercase tracking-tighter">
            Back_to_Top
          </span>
        </button>

        <div className="flex items-center gap-4">
          {["VISA", "MC", "GCASH", "PP"].map((pay) => (
            <div
              key={pay}
              className="px-4 py-2 bg-neutral-900/50 border border-neutral-800 text-[11px] font-black text-neutral-500 hover:text-red-600 hover:border-red-600/30 transition-all"
            >
              {pay}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
