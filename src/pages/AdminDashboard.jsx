import { useState, useEffect } from "react";
import supabase from "../supabase";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function AdminDashboard({ setPage }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("inventory");
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [expandedUser, setExpandedUser] = useState(null);

  // --- SYSTEM MODAL STATE ---
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // Pagination & Upload State
  const [uploadMode, setUploadMode] = useState("url");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const categories = [
    "Laptop",
    "MotherBoards",
    "Graphic Cards",
    "Cooling",
    "Phones",
    "Monitors",
    "Mouse",
    "CPU",
  ];

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    category: "Laptop",
    stock: "0",
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user || user.email !== "admin@metagear.com") {
          setPage("home");
        } else {
          setIsAuthorized(true);
          fetchData();
        }
      } catch (err) {
        setPage("home");
      }
    };
    checkAuth();
  }, [setPage]);

  const fetchData = async () => {
    setLoading(true);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [prodRes, orderRes] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select(
          `*, profiles(email), order_items(quantity, products(name, price, category))`,
        )
        .gte("created_at", fourteenDaysAgo.toISOString())
        .order("created_at", { ascending: false }),
    ]);

    if (prodRes.data) setProducts(prodRes.data);
    if (orderRes.data) setOrders(orderRes.data);
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("products").getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
    } catch (err) {
      alert(`UPLOAD_ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED DELETE LOGIC ---
  const handleDelete = async (id) => {
    setConfirmDelete({ show: true, id });
  };

  const executeDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ show: false, id: null });
    setLoading(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert(`TERMINATION_FAILURE: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const dailyStats = (orders || []).reduce((acc, order) => {
    const dateKey = new Date(order.created_at).toISOString().split("T")[0];
    const chartLabel = new Date(order.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (!acc[dateKey]) {
      acc[dateKey] = { date: chartLabel, sales: 0, categories: {} };
    }

    const orderTotal = order.total_price || 0;
    acc[dateKey].sales =
      Math.round((acc[dateKey].sales + orderTotal) * 100) / 100;

    order.order_items?.forEach((item) => {
      const cat = item.products?.category || "Other";
      const itemVal = (item.products?.price || 0) * (item.quantity || 1);
      const currentCatTotal = acc[dateKey].categories[cat] || 0;
      acc[dateKey].categories[cat] =
        Math.round((currentCatTotal + itemVal) * 100) / 100;
    });

    return acc;
  }, {});

  const chartData = Object.values(dailyStats).reverse();
  const currentSelection = dailyStats[selectedDate] || {
    sales: 0,
    categories: {},
  };
  const dailyTotal = currentSelection.sales;
  const dailyCats = currentSelection.categories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
    };
    try {
      const { error } = editingId
        ? await supabase.from("products").update(payload).eq("id", editingId)
        : await supabase.from("products").insert([payload]);

      if (error) throw error;
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        description: "",
        image_url: "",
        category: "Laptop",
        stock: "0",
      });
      fetchData();
    } catch (err) {
      alert(`System Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-red-600">
      {/* --- SYSTEM MODAL UI --- */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="border-[3px] border-red-600 bg-black p-8 max-w-sm w-full shadow-[0_0_60px_rgba(220,38,38,0.4)] relative">
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-600" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600" />
            <h2 className="text-red-600 font-[1000] text-xl italic uppercase tracking-tighter mb-2">
              TERMINATE_ASSET
            </h2>
            <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-8 border-b-2 border-neutral-800 pb-4">
              Warning: This action is irreversible. Proceed with unit
              decommissioning?
            </p>
            <div className="flex gap-4">
              <button
                onClick={executeDelete}
                className="flex-1 bg-red-600 py-3 text-[10px] font-[1000] uppercase tracking-widest hover:bg-red-700 transition-all border border-red-400"
              >
                Confirm_Delete
              </button>
              <button
                onClick={() => setConfirmDelete({ show: false, id: null })}
                className="flex-1 border-2 border-neutral-700 py-3 text-[10px] font-[1000] uppercase tracking-widest hover:bg-neutral-900 transition-all"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b-4 border-red-600 pb-6 shadow-[0_10px_30px_-15px_rgba(220,38,38,0.3)]">
          <div className="flex items-center gap-8">
            <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter">
              COMMAND_<span className="text-red-600">CENTER</span>
            </h1>
            <nav className="flex gap-2">
              {["inventory", "intel"].map((t) => (
                <button
                  key={t}
                  onClick={() => setView(t)}
                  className={`px-6 py-2 text-[10px] font-black border-2 transition-all ${view === t ? "bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "border-neutral-800 text-neutral-500 hover:border-neutral-600"}`}
                >
                  {t === "inventory" ? "ASSET_INV" : "INTEL_OPS"}
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={() => setPage("home")}
            className="text-[10px] font-black border-2 border-red-600 px-6 py-2 hover:bg-red-600 transition-all uppercase group relative overflow-hidden"
          >
            <span className="relative z-10">Exit_System</span>
            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </header>

        {view === "inventory" ? (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 p-6 border-2 border-neutral-800 bg-neutral-900/20 sticky top-8 relative"
              >
                <div className="absolute -top-[2px] -left-[2px] w-4 h-4 border-t-2 border-l-2 border-red-600" />
                <h2 className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                  {editingId ? "MODE: EDIT_ASSET" : "Deploy_New_Unit"}
                </h2>
                <select
                  className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-bold text-red-500 outline-none focus:border-red-600 transition-colors"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
                <input
                  required
                  placeholder="MODEL_NAME"
                  className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-bold outline-none focus:border-neutral-600 transition-colors"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="number"
                    placeholder="PRICE"
                    className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-bold outline-none focus:border-neutral-600"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                  <input
                    required
                    type="number"
                    placeholder="STOCK"
                    className="w-full bg-black border-2 border-red-600/50 p-3 text-xs font-bold outline-none text-red-500 focus:border-red-600"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setUploadMode("url")}
                    className={`flex-1 py-2 text-[9px] font-black border-2 ${uploadMode === "url" ? "bg-white text-black border-white" : "border-neutral-800 text-neutral-500 hover:border-neutral-700"}`}
                  >
                    URL_LINK
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={`flex-1 py-2 text-[9px] font-black border-2 ${uploadMode === "file" ? "bg-white text-black border-white" : "border-neutral-800 text-neutral-500 hover:border-neutral-700"}`}
                  >
                    FILE_UPLOAD
                  </button>
                </div>

                {uploadMode === "url" ? (
                  <input
                    required
                    placeholder="IMAGE_URL"
                    className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-mono outline-none focus:border-neutral-600"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                  />
                ) : (
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-mono outline-none file:hidden cursor-pointer group-hover:border-neutral-600 transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-red-600 italic pointer-events-none">
                      SELECT_FILE
                    </div>
                  </div>
                )}

                <textarea
                  placeholder="TECH_SPECS"
                  className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-bold h-24 outline-none focus:border-neutral-600 transition-colors"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-red-600 border-2 border-red-500 font-[1000] uppercase text-[10px] tracking-[0.3em] hover:bg-red-700 transition-all shadow-[0_5px_15px_rgba(220,38,38,0.2)]"
                >
                  {loading
                    ? "COMMUNICATING..."
                    : editingId
                      ? "SAVE_CHANGES"
                      : "CONFIRM_DEPLOYMENT"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <div className="flex flex-wrap gap-3 mb-8 border-b-2 border-neutral-900 pb-6">
                <button
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setCurrentPage(1);
                  }}
                  className={`relative px-5 py-2 text-[10px] font-black transition-all ${
                    selectedCategory === "ALL"
                      ? "text-white border-x-[3px] border-red-600 bg-red-600/10 shadow-[inset_0_0_10px_rgba(220,38,38,0.2)]"
                      : "text-neutral-500 border-x-2 border-neutral-800 hover:text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {selectedCategory === "ALL" && (
                    <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-600" />
                  )}
                  ALL_ASSETS
                  {selectedCategory === "ALL" && (
                    <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-600" />
                  )}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`relative px-5 py-2 text-[10px] font-black transition-all ${
                      selectedCategory === cat
                        ? "text-red-500 border-x-[3px] border-red-600 bg-red-600/10"
                        : "text-neutral-500 border-x-2 border-neutral-800 hover:border-neutral-700 hover:text-neutral-300"
                    }`}
                  >
                    {selectedCategory === cat && (
                      <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-600" />
                    )}
                    {cat.toUpperCase()}
                    {selectedCategory === cat && (
                      <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-600" />
                    )}
                  </button>
                ))}
              </div>

              {paginatedProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-neutral-900/10 border-2 border-neutral-800 hover:border-red-600/40 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-black border-2 border-neutral-800 p-1 group-hover:border-red-600/50 transition-colors">
                      <img
                        src={item.image_url}
                        className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                        alt=""
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase">
                        {item.name}
                      </h3>
                      <div className="flex gap-4">
                        <p className="text-red-600 font-mono text-xs">
                          ₱{item.price?.toLocaleString()}
                        </p>
                        <p
                          className={`text-[10px] font-black uppercase ${item.stock <= 5 ? "text-red-500 animate-pulse" : "text-neutral-500"}`}
                        >
                          Stock: {item.stock || 0}
                        </p>
                        <span className="text-[9px] text-neutral-600 font-mono uppercase">
                          [{item.category}]
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setFormData({
                          ...item,
                          price: item.price.toString(),
                          stock: item.stock.toString(),
                        });
                      }}
                      className="text-[9px] font-black text-white/40 hover:text-white uppercase border-b border-transparent hover:border-white transition-all"
                    >
                      Edit_Asset
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-[9px] font-black text-red-900/60 hover:text-red-600 uppercase border-b border-transparent hover:border-red-600 transition-all"
                    >
                      Terminate_Asset
                    </button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-neutral-800 text-neutral-600 text-[10px] font-black uppercase tracking-widest">
                  No assets found in {selectedCategory}
                </div>
              ) : (
                <div className="flex justify-between items-center mt-12 px-2">
                  <div className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                    Showing {paginatedProducts.length} of{" "}
                    {filteredProducts.length} Units
                  </div>
                  <div className="flex items-center gap-1 bg-neutral-900/30 p-1 border-2 border-neutral-800 relative">
                    <div className="absolute -top-[2px] -right-[2px] w-2 h-2 bg-red-600" />
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-[9px] font-black uppercase tracking-tighter transition-all hover:bg-neutral-800 disabled:opacity-20"
                    >
                      &lt; Prev_Page
                    </button>

                    <div className="flex gap-1 px-4 border-x-2 border-neutral-800">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          const isEdge = page === 1 || page === totalPages;
                          const isNear = Math.abs(page - currentPage) <= 1;

                          if (isEdge || isNear) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 text-[10px] font-bold transition-all border-2 ${
                                  currentPage === page
                                    ? "bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                                    : "border-transparent text-neutral-500 hover:text-white hover:border-neutral-700"
                                }`}
                              >
                                {String(page).padStart(2, "0")}
                              </button>
                            );
                          }
                          if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span
                                key={page}
                                className="text-neutral-700 self-center"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        },
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-[9px] font-black uppercase tracking-tighter transition-all hover:bg-neutral-800 disabled:opacity-20"
                    >
                      Next_Page &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-neutral-900/40 border-2 border-neutral-800 p-5 rounded-sm flex justify-between items-center backdrop-blur-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-green-500 font-black uppercase tracking-[0.2em] mb-1">
                      Market_Vol_Selected
                    </span>
                    <span className="text-2xl font-[1000] font-mono tracking-tighter">
                      ₱{dailyTotal.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-black border-2 border-neutral-700 text-[11px] font-black p-2 text-white outline-none cursor-pointer hover:border-red-600 transition-colors uppercase tracking-widest"
                  />
                </div>

                <div className="bg-neutral-900/30 border-2 border-neutral-800 p-6 rounded-sm min-h-[450px] relative">
                  <div className="absolute top-0 right-0 p-1 border-b-2 border-l-2 border-neutral-800 text-[8px] text-neutral-600 font-mono">
                    LIVE_FEED
                  </div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-600 italic">
                      Trajectory_Analysis
                    </h3>
                    <span className="text-[9px] font-mono text-neutral-500">
                      PERIOD: LAST_14_DAYS
                    </span>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="colorSales"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#dc2626"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#dc2626"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1f1f1f"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#444"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#444"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `₱${val / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `₱${value.toLocaleString()}`,
                            "Sales",
                          ]}
                          contentStyle={{
                            backgroundColor: "#000",
                            border: "2px solid #dc2626",
                            fontSize: "10px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#dc2626"
                          fill="url(#colorSales)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/30 border-2 border-neutral-800 p-6 rounded-sm relative">
                <div className="absolute -top-[2px] -right-[2px] w-3 h-3 border-t-2 border-r-2 border-neutral-600" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">
                  Market_Segmentation
                </h3>
                <div className="space-y-6">
                  {categories.map((cat) => {
                    const val = dailyCats[cat] || 0;
                    const percent =
                      dailyTotal > 0 ? (val / dailyTotal) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono uppercase">
                          <span className="text-neutral-400">{cat}</span>
                          <span className="text-white">
                            ₱{val.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-800 h-[3px] overflow-hidden border border-neutral-900">
                          <div
                            className="bg-red-600 h-full transition-all duration-1000 shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t-4 border-neutral-900 pt-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mb-6 italic">
                Transmission_Logs
              </h3>
              <div className="grid gap-4">
                {[...new Set(orders?.map((o) => o.profiles?.email))].map(
                  (email) => (
                    <div
                      key={email}
                      className="bg-neutral-900/20 border-2 border-neutral-800 rounded-sm overflow-hidden hover:border-neutral-700 transition-colors"
                    >
                      <button
                        onClick={() =>
                          setExpandedUser(expandedUser === email ? null : email)
                        }
                        className="w-full p-4 flex justify-between items-center hover:bg-neutral-800 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                          <span className="text-white font-black font-mono text-sm uppercase tracking-tighter italic">
                            {email}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest border-2 border-neutral-800 px-3 py-1">
                          {expandedUser === email
                            ? "Close_Log ▲"
                            : "Access_Orders ▼"}
                        </span>
                      </button>
                      {expandedUser === email && (
                        <div className="p-4 bg-black/60 border-t-2 border-neutral-800 grid gap-4">
                          {orders
                            .filter((o) => o.profiles?.email === email)
                            .map((order) => (
                              <div
                                key={order.id}
                                className="border border-neutral-800 p-4 bg-neutral-900/40"
                              >
                                <div className="flex justify-between mb-4 border-b border-neutral-800 pb-2">
                                  <span className="text-[9px] font-mono text-red-500">
                                    ID: {order.id.slice(0, 8)}...
                                  </span>
                                  <span className="text-[9px] font-mono text-neutral-500">
                                    {new Date(
                                      order.created_at,
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {order.order_items?.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between text-[10px] uppercase font-bold"
                                    >
                                      <span>
                                        {item.products?.name} x{item.quantity}
                                      </span>
                                      <span className="text-neutral-400">
                                        ₱
                                        {(
                                          item.products?.price * item.quantity
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-2 border-t border-neutral-800 flex justify-between">
                                  <span className="text-[10px] font-black uppercase text-red-600">
                                    Total_Charge
                                  </span>
                                  <span className="text-sm font-black text-white">
                                    ₱{order.total_price?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
