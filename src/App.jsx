import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import supabase from "./supabase";

// Sections
import Header from "./sections/Header";
import Footer from "./sections/Footer";

// Pages
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Landing from "./pages/Landing";

// Dashboard Imports
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";

export default function App() {
  const [session, setSession] = useState(null);
  const ADMIN_EMAIL = "admin@metagear.com";

  // --- ZERO-DELAY MOUSE TRACKING ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  // --- EXISTING STATE & NAVIGATION LOGIC ---
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("metagear_current_page");
    const isInitialized =
      localStorage.getItem("metagear_initialized") === "true";
    return isInitialized ? savedPage || "home" : "landing";
  });

  const [dashboardTab, setDashboardTab] = useState("manifests");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  useEffect(() => {
    localStorage.setItem("metagear_current_page", currentPage);
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === "SIGNED_IN" && session) {
        localStorage.setItem("metagear_initialized", "true");
        setCurrentPage(session.user.email === ADMIN_EMAIL ? "admin" : "home");
      }
      if (_event === "SIGNED_OUT") {
        setCart([]);
        localStorage.removeItem("metagear_initialized");
        setCurrentPage("landing");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSystemEnter = () => {
    localStorage.setItem("metagear_initialized", "true");
    setCurrentPage("home");
  };

  const viewDetails = (product) => {
    setSelectedProduct(product);
    setCurrentPage("details");
  };

  const addToCart = (product, quantity = 1) => {
    if (!session) {
      setCurrentPage("login");
      return;
    }
    const itemsToAdd = Array(quantity).fill(product);
    setCart((prevCart) => [...prevCart, ...itemsToAdd]);
    setToast(`${quantity}X ${product.name.toUpperCase()} ADDED TO LOADOUT`);
    setTimeout(() => setToast(null), 3000);
  };

  // --- NEW WISHLIST LOGIC ---
  const addToWishlist = async (product) => {
    if (!session) {
      setCurrentPage("login");
      return;
    }

    try {
      const { error } = await supabase
        .from("wishlist")
        .insert([{ user_id: session.user.id, product_id: product.id }]);

      if (error) throw error;
      setToast(`TARGET_SECURED: ${product.name.toUpperCase()} TAGGED`);
    } catch (error) {
      setToast(
        error.code === "23505"
          ? "ALERT: TARGET ALREADY TAGGED"
          : "ERROR: UPLINK_FAILURE",
      );
    }
    setTimeout(() => setToast(null), 3000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <Landing onEnter={handleSystemEnter} />;
      case "home":
        return (
          <Home
            addToCart={addToCart}
            addToWishlist={addToWishlist}
            onViewDetails={viewDetails}
            searchQuery={searchQuery}
            setPage={setCurrentPage}
          />
        );
      case "details":
        return (
          <ProductDetails
            product={selectedProduct}
            setPage={setCurrentPage}
            addToCart={addToCart}
            session={session}
          />
        );
      case "cart":
        return (
          <Cart cartItems={cart} setPage={setCurrentPage} setCart={setCart} />
        );
      case "checkout":
        return (
          <Checkout
            cartItems={cart || []}
            setPage={setCurrentPage}
            setCart={setCart}
          />
        );
      case "login":
        return <Login setPage={setCurrentPage} />;
      case "dashboard":
        if (isAdmin) {
          setCurrentPage("admin");
          return <AdminDashboard setPage={setCurrentPage} />;
        }
        return (
          <AgentDashboard
            session={session}
            activeTab={dashboardTab}
            setActiveTab={setDashboardTab}
            addToCart={addToCart}
          />
        );
      case "admin":
        return isAdmin ? (
          <AdminDashboard setPage={setCurrentPage} />
        ) : (
          <Home
            addToCart={addToCart}
            addToWishlist={addToWishlist}
            onViewDetails={viewDetails}
            searchQuery={searchQuery}
            setPage={setCurrentPage}
          />
        );
      default:
        return (
          <Home
            addToCart={addToCart}
            addToWishlist={addToWishlist}
            onViewDetails={viewDetails}
            searchQuery={searchQuery}
            setPage={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden font-sans select-none relative">
      <style>
        {`
          * { cursor: none !important; }
          body { 
            overflow-x: hidden; 
            background: #020202; /* Match the tactical theme background */
          }
          /* Custom scrollbar to keep theme consistency */
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #0a0a0a; }
          ::-webkit-scrollbar-thumb { background: #dc2626; }
        `}
      </style>

      {/* --- THE ONE TRUE GLOBAL CROSSHAIR --- */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[10000] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="absolute w-full h-[1px] bg-red-600/40" />
        <div className="absolute h-full w-[1px] bg-red-600/40" />
        <div className="w-2 h-2 border border-red-600 shadow-[0_0_10px_red] bg-black/20" />
        <div className="w-0.5 h-0.5 bg-red-500 rounded-full" />
      </motion.div>

      {currentPage !== "landing" && (
        <Header
          session={session}
          isAdmin={isAdmin}
          setPage={setCurrentPage}
          setDashboardTab={setDashboardTab}
          cartCount={cart.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setCart={setCart}
        />
      )}

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>

        {/* --- TACTICAL HUD NOTIFICATIONS (TOAST) --- */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: 100, x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              exit={{ y: 100, x: "-50%", opacity: 0 }}
              className="fixed bottom-10 left-1/2 z-[200] bg-black text-white px-8 py-4 border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
              style={{
                clipPath:
                  "polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-red-600 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                  {toast}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {currentPage !== "landing" && <Footer />}
    </div>
  );
}
