import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import supabase from "../supabase";
import Hero from "../sections/Hero";
import ProductGrid from "../sections/ProductGrid";

export default function Home({
  addToCart,
  onViewDetails,
  searchQuery,
  setPage,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // SECTION REFS FOR NAVIGATION
  const categorySectionRef = useRef(null);
  const productGridRef = useRef(null);

  const scrollToCategories = () => {
    categorySectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // AUTO-SCROLL TO RESULTS WHEN SEARCHING
  useEffect(() => {
    if (searchQuery.length > 0) {
      productGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [searchQuery]);

  // Function to handle category selection and scroll
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(
      selectedCategory === categoryName ? "All" : categoryName,
    );

    setTimeout(() => {
      productGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // 1. SCROLL LOGIC
  const containerRef = useRef(null);
  const { scrollXProgress } = useScroll({ container: containerRef });
  const scrollPercent = useTransform(scrollXProgress, [0, 1], ["0%", "100%"]);

  // 2. DRAG-TO-SCROLL LOGIC
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    isDragging.current = false;
  };

  const handleMouseMoveScroll = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const categories = [
    {
      name: "Laptops",
      img: "https://sm.ign.com/ign_in/screenshot/default/asus-tuf-gaming-a14_r7cy.jpg",
    },
    {
      name: "Motherboards",
      img: "https://ecommerce.datablitz.com.ph/cdn/shop/files/f4sd56fsd4af_600x600_crop_center.jpg?v=1759548793",
    },
    {
      name: "Graphics Cards",
      img: "https://m.media-amazon.com/images/I/813Lh2QIZNL.jpg",
    },
    {
      name: "Cooling",
      img: "https://dlcdnwebimgs.asus.com/gain/1481c42f-b431-43d7-9a4f-742169abeeb6/w692",
    },
    {
      name: "Phones",
      img: "https://www.makotekcomputers.com/cdn/shop/files/ASUS-ROG-PHONE-7-12GB256GB-BLACK-SMARTPHONE.jpg?v=1691452392&width=535",
    },
    {
      name: "Monitors",
      img: "https://gameone.ph/media/catalog/product/mpiowebpcache/40a3f21bcdf28d0838130be41a736821/a/s/asus-rog-strix-xg27aqwmg-26-5-oled-280hz-qhd-gaming-monitor-1.jpg",
    },
    {
      name: "Mouses",
      img: "https://www.techspot.com/images/products/2015/mice/org/2016-07-05-product-3.jpg",
    },
  ];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      p.category?.toLowerCase().replace(/\s/g, "") ===
        selectedCategory.toLowerCase().replace(/\s/g, "");
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="bg-[#020202] min-h-screen text-white overflow-hidden relative">
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes glitch-anim {
            0% { clip: rect(44px, 9999px, 56px, 0); transform: skew(0.5deg); }
            20% { clip: rect(12px, 9999px, 80px, 0); transform: skew(-0.5deg); }
            100% { clip: rect(44px, 9999px, 56px, 0); transform: skew(0.5deg); }
          }
          .glitch-hover:hover::before {
            content: "SCANNING...";
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(220, 38, 38, 0.1);
            animation: glitch-anim 0.2s infinite;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: 900; color: #dc2626; z-index: 20;
          }
        `}
      </style>

      <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/3px-tile.png')] opacity-20" />
      </div>

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-red-600 origin-left z-[100] shadow-[0_0_15px_#dc2626]"
        style={{ scaleX }}
      />

      <div className="relative z-10">
        {!searchQuery && <Hero setPage={scrollToCategories} />}

        {!searchQuery && (
          <section
            ref={categorySectionRef}
            className="py-24 px-6 relative border-y border-red-600/20 overflow-hidden bg-black/60 backdrop-blur-md"
          >
            <div className="max-w-7xl mx-auto relative">
              <header className="mb-12 flex justify-between items-end">
                <motion.div
                  initial={{ opacity: 0, skewX: -20 }}
                  whileInView={{ opacity: 1, skewX: 0 }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="h-[2px] w-12 bg-red-600 shadow-[0_0_10px_red]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 italic">
                      SYSTEM_MANIFEST
                    </span>
                  </div>
                  <h2 className="text-5xl font-[1000] uppercase italic tracking-tighter text-white">
                    GEAR<span className="text-red-600">_</span>DEPT
                  </h2>
                </motion.div>

                <div className="hidden md:block text-right">
                  <div className="bg-red-600/10 border border-red-600/30 px-4 py-2 flex items-center gap-4">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">
                      Sector_Scroll
                    </span>
                    <motion.span className="text-lg font-mono text-red-600 font-black tracking-tighter">
                      {scrollPercent}
                    </motion.span>
                  </div>
                </div>
              </header>

              <div className="relative group">
                <div
                  ref={containerRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeaveOrUp}
                  onMouseUp={handleMouseLeaveOrUp}
                  onMouseMove={handleMouseMoveScroll}
                  className="flex gap-8 overflow-x-auto pb-20 hide-scrollbar cursor-grab active:cursor-grabbing snap-x snap-mandatory scroll-smooth select-none"
                >
                  {categories.map((cat, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="relative shrink-0 w-80 snap-center glitch-hover"
                    >
                      <div
                        className={`relative p-8 transition-all duration-300 border-2 ${
                          selectedCategory === cat.name
                            ? "bg-neutral-900 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.3)]"
                            : "bg-neutral-950 border-neutral-800 hover:border-red-600/50"
                        }`}
                        style={{
                          clipPath:
                            "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)",
                        }}
                      >
                        <div className="h-48 flex items-center justify-center relative mb-8 overflow-hidden">
                          <img
                            src={cat.img}
                            alt={cat.name}
                            draggable="false"
                            className={`max-h-full object-contain z-10 filter transition-all duration-700 ${
                              selectedCategory === cat.name
                                ? "scale-110 rotate-2"
                                : "grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100"
                            }`}
                          />
                        </div>
                        <div className="flex justify-between items-center border-t border-red-600/20 pt-4">
                          <span
                            className={`text-sm font-black uppercase tracking-[0.2em] ${selectedCategory === cat.name ? "text-red-600" : "text-neutral-500"}`}
                          >
                            {cat.name}
                          </span>
                          <div className="w-2 h-2 bg-red-600 animate-pulse rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="absolute -bottom-4 left-0 w-full h-[2px] bg-neutral-900 overflow-hidden">
                  <motion.div
                    className="absolute h-full bg-red-600 shadow-[0_0_15px_#dc2626]"
                    style={{ width: scrollPercent }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        <div
          ref={productGridRef}
          className="max-w-[1400px] mx-auto px-6 py-24 relative"
        >
          {!loading && (
            <div className="flex flex-col mb-12">
              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-[1000] uppercase italic tracking-tighter">
                  TARGET<span className="text-red-600">:</span>{" "}
                  {searchQuery
                    ? `SEARCHING "${searchQuery}"`
                    : selectedCategory}
                </h3>
                <div className="h-[2px] flex-grow bg-gradient-to-r from-red-600 to-transparent opacity-20" />
              </div>
              <span className="text-[10px] font-mono text-neutral-600 mt-2">
                DEPLOYING_ASSETS_FROM_DATABASE_STREAMS...
              </span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-red-600/10 rounded-full" />
                <motion.div
                  className="absolute inset-0 border-t-4 border-red-600 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <span className="text-[11px] font-black tracking-[0.8em] text-red-600 animate-pulse">
                UPLOADING_INVENTORY
              </span>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              addToCart={addToCart}
              onViewDetails={onViewDetails}
            />
          )}
        </div>
      </div>
    </main>
  );
}
