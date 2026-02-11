import { useState, useEffect } from "react";
import supabase from "../supabase";

export default function AdminDashboard({ setPage }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("inventory");
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // States for Editing, Search, and Filtering
  const [editingId, setEditingId] = useState(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedAgent, setSelectedAgent] = useState(null); // New state for filtering by agent

  const categories = [
    "Laptop",
    "MotherBoards",
    "GrapicCards",
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
  });

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email !== "admin@metagear.com") {
        setPage("home");
      } else {
        setIsAuthorized(true);
        fetchData();
      }
    };
    checkAuth();
  }, [setPage, view]);

  const fetchData = async () => {
    if (view === "inventory") {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setProducts(data);
    } else {
      const { data: orderData } = await supabase
        .from("orders")
        .select(
          `
          *,
          profiles(email),
          order_items(
            quantity,
            products(name, price)
          )
        `,
        )
        .order("created_at", { ascending: false });
      if (orderData) setOrders(orderData);

      const { data: userData } = await supabase.from("profiles").select("*");
      if (userData) setUsers(userData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData, price: parseFloat(formData.price) };

    try {
      let result = editingId
        ? await supabase.from("products").update(payload).eq("id", editingId)
        : await supabase.from("products").insert([payload]);

      if (result.error) {
        alert(`DB ERROR: ${result.error.message}`);
      } else {
        setEditingId(null);
        setFormData({
          name: "",
          price: "",
          description: "",
          image_url: "",
          category: "Laptop",
        });
        fetchData();
      }
    } catch (err) {
      alert("System error.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      image_url: product.image_url,
      category: product.category,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(adminSearch.toLowerCase());
    const matchesCat = activeFilter === "ALL" || p.category === activeFilter;
    return matchesSearch && matchesCat;
  });

  // Filter orders based on the clicked agent
  const displayOrders = selectedAgent
    ? orders.filter((o) => o.profiles?.email === selectedAgent)
    : orders;

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-red-600">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-red-600/30 pb-6">
          <div className="flex items-center gap-8">
            <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter text-white">
              COMMAND_<span className="text-red-600">CENTER</span>
            </h1>
            <nav className="flex gap-2">
              <button
                onClick={() => setView("inventory")}
                className={`px-6 py-2 text-[10px] font-black border transition-all ${view === "inventory" ? "bg-red-600 border-red-600 text-white" : "border-neutral-800 text-neutral-500 hover:text-white"}`}
              >
                ASSET_INV
              </button>
              <button
                onClick={() => setView("intel")}
                className={`px-6 py-2 text-[10px] font-black border transition-all ${view === "intel" ? "bg-red-600 border-red-600 text-white" : "border-neutral-800 text-neutral-500 hover:text-white"}`}
              >
                INTEL_OPS
              </button>
            </nav>
          </div>
          <button
            onClick={() => setPage("home")}
            className="text-[10px] font-black border border-red-600/50 px-6 py-2 hover:bg-red-600 transition-all uppercase"
          >
            Exit_System
          </button>
        </header>

        {view === "inventory" ? (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* INVENTORY FORM */}
            <div className="lg:col-span-1">
              <form
                onSubmit={handleSubmit}
                className={`space-y-4 p-6 border transition-all sticky top-8 ${editingId ? "bg-red-600/5 border-red-600" : "bg-neutral-900/20 border-neutral-800"}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em]">
                    {editingId ? "MODE: EDIT_ASSET" : "Deploy_New_Unit"}
                  </h2>
                  <div
                    className={`w-2 h-2 rounded-full ${editingId ? "bg-yellow-500 animate-pulse" : "bg-red-600"}`}
                  ></div>
                </div>

                <select
                  className="w-full bg-black border border-neutral-800 p-3 text-xs font-bold focus:border-red-600 outline-none text-red-500"
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
                  className="w-full bg-black border border-neutral-800 p-3 text-xs font-bold focus:border-red-600 outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  required
                  type="number"
                  placeholder="PRICE (PHP)"
                  className="w-full bg-black border border-neutral-800 p-3 text-xs font-bold focus:border-red-600 outline-none"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                <input
                  required
                  placeholder="IMAGE_URL"
                  className="w-full bg-black border border-neutral-800 p-3 text-xs font-mono focus:border-red-600 outline-none"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                />
                <textarea
                  placeholder="TECH_SPECS"
                  className="w-full bg-black border border-neutral-800 p-3 text-xs font-bold h-24 focus:border-red-600 outline-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-red-600 font-[1000] uppercase text-[10px] tracking-[0.3em] hover:bg-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  {loading
                    ? "COMMUNICATING..."
                    : editingId
                      ? "SAVE_CHANGES"
                      : "CONFIRM_DEPLOYMENT"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        name: "",
                        price: "",
                        description: "",
                        image_url: "",
                        category: "Laptop",
                      });
                    }}
                    className="w-full py-2 text-[9px] font-black text-neutral-500 uppercase hover:text-white transition-all"
                  >
                    Cancel_Edit
                  </button>
                )}
              </form>
            </div>

            {/* INVENTORY LIST */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-neutral-900/40 border border-neutral-800 p-4 space-y-4">
                <input
                  type="text"
                  placeholder="// FILTER_DATABASE..."
                  className="w-full bg-black border border-neutral-800 p-3 text-xs font-bold outline-none focus:border-red-600"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveFilter("ALL")}
                    className={`px-3 py-1 text-[9px] font-black border transition-all ${activeFilter === "ALL" ? "bg-white text-black border-white" : "border-neutral-800 text-neutral-500"}`}
                  >
                    ALL
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={`px-3 py-1 text-[9px] font-black border transition-all ${activeFilter === cat ? "bg-red-600 border-red-600 text-white" : "border-neutral-800 text-neutral-500"}`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-neutral-900/10 border border-neutral-800 hover:border-red-600/40 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-black border border-neutral-800 p-1">
                        <img
                          src={item.image_url}
                          className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                          alt=""
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] px-1.5 py-0.5 bg-red-600/10 text-red-500 border border-red-600/20 font-bold">
                            {item.category}
                          </span>
                          <h3 className="font-black text-sm uppercase">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-red-600 font-mono text-xs">
                          ₱{item.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-[9px] font-black text-white/40 hover:text-white transition-all uppercase"
                      >
                        Edit_Asset
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("ERASE?")) {
                            await supabase
                              .from("products")
                              .delete()
                              .eq("id", item.id);
                            fetchData();
                          }
                        }}
                        className="text-[9px] font-black text-neutral-700 hover:text-red-600 transition-all uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* INTEL_OPS VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* REGISTERED AGENTS SIDEBAR */}
            <div className="lg:col-span-4">
              <div className="flex justify-between items-center mb-6 border-l-2 border-red-600 pl-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                  Registered_Agents
                </h2>
                {selectedAgent && (
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-[8px] font-black bg-neutral-800 px-2 py-1 hover:bg-red-600 transition-all uppercase"
                  >
                    Show_All_Manifests
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedAgent(u.email)}
                    className={`p-4 border cursor-pointer transition-all ${selectedAgent === u.email ? "bg-red-600/10 border-red-600" : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-600"}`}
                  >
                    <p className="text-[8px] font-mono text-neutral-500 uppercase mb-1">
                      Agent_ID: {String(u.id).slice(0, 8)}
                    </p>
                    <p className="text-sm font-black uppercase">{u.email}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ORDER MANIFESTS VIEW */}
            <div className="lg:col-span-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-6 border-l-2 border-red-600 pl-4">
                {selectedAgent
                  ? `Manifests_For: ${selectedAgent}`
                  : "Order_Manifests"}
              </h2>
              <div className="space-y-3">
                {displayOrders.length > 0 ? (
                  displayOrders.map((o) => {
                    // Logic: Est. Delivery is 3 days after created_at
                    const deliveryDate = new Date(o.created_at);
                    deliveryDate.setDate(deliveryDate.getDate() + 3);

                    return (
                      <div
                        key={o.id}
                        className="flex flex-col p-5 bg-neutral-900/20 border-l-4 border-red-600 border-r border-t border-b border-neutral-800"
                      >
                        <div className="flex justify-between items-start w-full">
                          <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                              ORD_{String(o.id).slice(0, 12)}
                            </p>
                            <h3 className="text-sm font-black uppercase mt-1">
                              {o.profiles?.email}
                            </h3>
                            <div className="flex gap-4 mt-3">
                              <span className="text-[9px] px-2 py-0.5 bg-red-600 text-white font-black uppercase">
                                {o.status}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-[7px] text-neutral-500 uppercase font-black">
                                  Ordered
                                </span>
                                <span className="text-[10px] text-neutral-300 font-bold">
                                  {new Date(o.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex flex-col border-l border-neutral-800 pl-3">
                                <span className="text-[7px] text-red-500 uppercase font-black">
                                  Est_Delivery
                                </span>
                                <span className="text-[10px] text-white font-bold">
                                  {deliveryDate.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-[1000] italic text-white">
                              ₱{o.total_price?.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-neutral-800/50">
                          <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-2">
                            Manifest_Items:
                          </p>
                          <div className="space-y-1">
                            {o.order_items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-[10px] uppercase font-bold text-neutral-400"
                              >
                                <span>
                                  {item.quantity}x {item.products?.name}
                                </span>
                                <span>
                                  ₱
                                  {(
                                    item.products?.price * item.quantity
                                  ).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 border border-dashed border-neutral-800 flex items-center justify-center">
                    <p className="text-neutral-700 font-black text-[10px] uppercase tracking-widest">
                      No_Manifests_Found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
