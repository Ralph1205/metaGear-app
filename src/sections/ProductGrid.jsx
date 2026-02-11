import ProductCard from "./ProductCard";

export default function ProductGrid({ products, addToCart, onViewDetails }) {
  return (
    /* Changed to w-full and removed max-width constraints */
    <div className="relative w-full min-h-screen overflow-hidden bg-[#050505] py-20 px-4 md:px-10">
      {/* --- MOVING TACTICAL BACKGROUND LAYER (Now Spans Full Screen) --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            animation: "moveGrid 20s linear infinite",
          }}
        />
        {/* Moving Red Ambient Flare */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #dc2626 0%, transparent 50%)",
            animation: "pulseFlare 12s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* CSS For Background Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes moveGrid {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
        @keyframes pulseFlare {
          0% { transform: translate(-20%, -20%) scale(1); opacity: 0.1; }
          100% { transform: translate(20%, 20%) scale(1.5); opacity: 0.3; }
        }
      `,
        }}
      />

      {/* GRID CONTENT - Now using max-w-none to allow full expansion */}
      <div className="relative z-10 w-full max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            addToCart={addToCart}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
