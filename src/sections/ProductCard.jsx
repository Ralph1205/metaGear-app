import { motion } from "framer-motion";

export default function ProductCard({
  product,
  addToCart,
  onViewDetails,
  index,
}) {
  const techImages = ["1714208", "2582937", "4523002", "2115256", "777001"];
  const imageSource = product.image_url?.includes("http")
    ? product.image_url
    : `https://images.pexels.com/photos/${techImages[product.id % techImages.length]}/pexels-photo.jpg?auto=compress&w=800`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.1, duration: 0.5 }}
      onClick={() => onViewDetails(product)}
      className="group relative bg-neutral-900 border-2 border-neutral-800 overflow-hidden flex flex-col h-full cursor-pointer hover:border-red-600 transition-all duration-500 shadow-2xl"
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
      }}
    >
      {/* --- IMAGE / HUD LAYER --- */}
      <figure className="relative h-64 overflow-hidden border-b-2 border-neutral-800 group-hover:border-red-600 transition-colors">
        <img
          src={imageSource}
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
          alt={product.name}
        />

        {/* Holographic Scanning Line */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/20 to-transparent h-1/2 w-full -translate-y-full group-hover:animate-[scan_2s_linear_infinite] pointer-events-none opacity-0 group-hover:opacity-100" />

        {/* Top Overlay HUD */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-black/80 text-red-600 text-[8px] font-black px-2 py-0.5 border border-red-600/40 uppercase tracking-tighter">
            ID_{product.id?.toString().padStart(4, "0")}
          </span>
          <span className="bg-black/80 text-white text-[8px] font-black px-2 py-0.5 border border-white/20 uppercase tracking-tighter">
            SEC_STABLE
          </span>
        </div>

        {/* View Details Overlay */}
        <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2 border-2 border-red-600 -skew-x-12 shadow-[0_0_20px_rgba(255,0,0,0.5)]">
            Open_Manifest
          </div>
        </div>
      </figure>

      {/* --- CONTENT LAYER --- */}
      <div className="p-5 flex flex-col flex-grow bg-black">
        <div className="mb-3">
          <h2 className="text-xl font-[1000] text-white uppercase italic tracking-tighter leading-none group-hover:text-red-600 transition-colors">
            {product.name}
          </h2>
          <div className="w-8 h-1 bg-red-600 mt-2 group-hover:w-full transition-all duration-500" />
        </div>

        <p className="text-neutral-500 text-[11px] font-medium leading-tight line-clamp-2 mb-6 italic">
          {product.description ||
            "High-performance gear optimized for tactical deployment in extreme environments."}
        </p>

        {/* --- BOTTOM ACTION LAYER --- */}
        <div className="mt-auto pt-4 border-t border-neutral-800 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] text-red-600 font-black uppercase tracking-widest mb-1">
              Credit_Value
            </span>
            <span className="text-2xl font-[1000] text-white italic tracking-tighter">
              ₱{product.price?.toLocaleString()}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="relative px-4 py-2 bg-white text-black font-black uppercase text-[9px] tracking-widest hover:bg-red-600 hover:text-white transition-all overflow-hidden"
          >
            Deploy_To_Cart
          </button>
        </div>
      </div>

      {/* Industrial Corner Detail */}
      <div className="absolute bottom-1 right-1 w-4 h-4 bg-red-600 rotate-45 translate-x-2 translate-y-2 group-hover:scale-150 transition-transform" />
    </motion.div>
  );
}
