import { useState, useEffect } from "react";
import supabase from "../supabase";
import "cally";
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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [expandedUser, setExpandedUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL_ASSETS");

  const [invPage, setInvPage] = useState(1);
  const invPerPage = 6;

  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 5;

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

  const filteredProducts =
    activeCategory === "ALL_ASSETS"
      ? products
      : products.filter(
          (p) => p.category.toUpperCase() === activeCategory.toUpperCase(),
        );

  const totalInvPages = Math.ceil(filteredProducts.length / invPerPage);
  const paginatedProducts = filteredProducts.slice(
    (invPage - 1) * invPerPage,
    invPage * invPerPage,
  );

  const getSalesForDate = (date) => {
    const dailyOrders =
      orders?.filter((o) => o.created_at?.startsWith(date)) || [];
    const total = dailyOrders.reduce(
      (acc, curr) => acc + (curr.total_price || 0),
      0,
    );
    const catBreakdown = {};
    dailyOrders.forEach((order) => {
      order.order_items?.forEach((item) => {
        const cat = item.products?.category || "Other";
        const val = (item.products?.price || 0) * (item.quantity || 1);
        catBreakdown[cat] = (catBreakdown[cat] || 0) + val;
      });
    });
    return { total, catBreakdown };
  };

  const chartData = (orders || [])
    .reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.sales += order.total_price || 0;
      } else {
        acc.push({ date, sales: order.total_price || 0 });
      }
      return acc;
    }, [])
    .reverse();

  const { total: dailyTotal, catBreakdown: dailyCats } =
    getSalesForDate(selectedDate);

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

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-red-600">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
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
            className="text-[10px] font-black border-2 border-red-600 px-6 py-2 hover:bg-red-600 transition-all uppercase"
          >
            Exit_System
          </button>
        </header>

        {view === "inventory" ? (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 p-6 border-2 border-red-600 bg-neutral-900/20 sticky top-8 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
              >
                <h2 className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em]">
                  {editingId ? "MODE: EDIT_ASSET" : "Deploy_New_Unit"}
                </h2>
                <select
                  className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-bold text-red-500 outline-none focus:border-red-600"
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
                  className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-bold outline-none focus:border-red-600"
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
                    className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-bold outline-none focus:border-red-600"
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
                <input
                  required
                  placeholder="IMAGE_URL"
                  className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-mono outline-none focus:border-red-600"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                />
                <textarea
                  placeholder="TECH_SPECS"
                  className="w-full bg-black border-2 border-neutral-800 p-3 text-xs font-bold h-24 outline-none focus:border-red-600"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-red-600 font-[1000] uppercase text-[10px] tracking-[0.3em] hover:bg-red-700 transition-all shadow-[0_5px_15px_rgba(220,38,38,0.2)]"
                >
                  {loading
                    ? "COMMUNICATING..."
                    : editingId
                      ? "SAVE_CHANGES"
                      : "CONFIRM_DEPLOYMENT"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-wrap gap-2 border-b-2 border-neutral-900 pb-4">
                {["ALL_ASSETS", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setInvPage(1);
                    }}
                    className={`px-4 py-1 text-[9px] font-black border-2 transition-all ${activeCategory === cat ? "border-red-600 text-red-600 bg-red-600/5 shadow-[0_0_10px_rgba(220,38,38,0.1)]" : "border-neutral-800 text-neutral-500 hover:border-neutral-600"}`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {paginatedProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-neutral-900/10 border-2 border-neutral-900 hover:border-red-600 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-black border-2 border-neutral-800 p-1 group-hover:border-red-600/50">
                        <img
                          src={item.image_url}
                          className="w-full h-full object-contain grayscale group-hover:grayscale-0"
                          alt=""
                        />
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase group-hover:text-red-500 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex gap-4">
                          <p className="text-red-600 font-mono text-xs">
                            ₱{item.price?.toLocaleString()}
                          </p>
                          <p
                            className={`text-[10px] font-black uppercase ${item.stock <= 0 ? "text-red-600 animate-pulse" : item.stock <= 5 ? "text-orange-500" : "text-neutral-500"}`}
                          >
                            Stock: {item.stock || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setFormData({
                          ...item,
                          price: item.price.toString(),
                          stock: item.stock.toString(),
                        });
                      }}
                      className="text-[9px] font-black text-white/40 hover:text-white uppercase border-2 border-transparent hover:border-red-600 px-3 py-1 transition-all"
                    >
                      Edit_Asset
                    </button>
                  </div>
                ))}
              </div>

              {totalInvPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="join border-2 border-red-600 p-1 bg-black">
                    <button
                      className="join-item btn btn-xs bg-black border-none text-white hover:bg-red-600 disabled:opacity-30"
                      disabled={invPage === 1}
                      onClick={() => setInvPage((p) => p - 1)}
                    >
                      «
                    </button>
                    <button className="join-item btn btn-xs bg-red-600 border-none text-white no-animation">
                      PAGE {invPage} / {totalInvPages}
                    </button>
                    <button
                      className="join-item btn btn-xs bg-black border-none text-white hover:bg-red-600 disabled:opacity-30"
                      disabled={invPage === totalInvPages}
                      onClick={() => setInvPage((p) => p + 1)}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center bg-neutral-900/40 border-2 border-red-600 p-6 relative">
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-600"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-red-600 font-black uppercase tracking-[0.2em] mb-1">
                      Target_Date_Revenue
                    </span>
                    <span className="text-3xl font-[1000] font-mono text-white">
                      ₱{dailyTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      popovertarget="cally-popover"
                      className="bg-black border-2 border-red-600 text-xs font-black font-mono p-3 text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase"
                      id="date-display"
                    >
                      {selectedDate || "Pick a date"}
                    </button>
                    <div
                      popover="auto"
                      id="cally-popover"
                      className="bg-black border-2 border-red-600 p-4 shadow-[0_0_50px_rgba(220,38,38,0.3)] rounded-none mt-2"
                    >
                      <calendar-date
                        className="cally text-white"
                        value={selectedDate}
                        onchange={(e) => {
                          setSelectedDate(e.target.value);
                          document
                            .getElementById("cally-popover")
                            .hidePopover();
                        }}
                      >
                        <svg
                          aria-label="Previous"
                          className="fill-red-600 size-4 cursor-pointer"
                          slot="previous"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                        </svg>
                        <svg
                          aria-label="Next"
                          className="fill-red-600 size-4 cursor-pointer"
                          slot="next"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                        </svg>
                        <calendar-month></calendar-month>
                      </calendar-date>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900/30 border-2 border-neutral-900 p-6 h-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <XAxis dataKey="date" stroke="#444" fontSize={10} />
                      <YAxis
                        stroke="#444"
                        fontSize={10}
                        tickFormatter={(val) => `₱${val / 1000}k`}
                      />
                      <Tooltip
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
                        fill="#dc262633"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-neutral-900/30 border-2 border-neutral-900 p-6 relative">
                <div className="absolute top-0 right-0 p-1 text-[8px] text-neutral-800 font-mono">
                  SEG_INTEL_V1.0
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 border-l-4 border-red-600 pl-3">
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
                        <div className="w-full bg-neutral-800 h-0.75">
                          <div
                            className="bg-red-600 h-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t-4 border-red-600 pt-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-600 mb-6 italic flex items-center gap-3">
                <span className="w-8 h-0.5 bg-red-600"></span>
                Transmission_Logs
              </h3>
              <div className="grid gap-4">
                {[...new Set(orders?.map((o) => o.profiles?.email))].map(
                  (email) => {
                    const userOrders = orders.filter(
                      (o) => o.profiles?.email === email,
                    );
                    const totalUserPages = Math.ceil(
                      userOrders.length / ordersPerPage,
                    );
                    const currentOrders = userOrders.slice(
                      (orderPage - 1) * ordersPerPage,
                      orderPage * ordersPerPage,
                    );

                    return (
                      <div
                        key={email}
                        className="bg-neutral-900/20 border-2 border-neutral-900 overflow-hidden transition-all duration-500"
                      >
                        <button
                          onClick={() => {
                            setExpandedUser(
                              expandedUser === email ? null : email,
                            );
                            setOrderPage(1);
                          }}
                          className={`w-full p-5 flex justify-between items-center ${expandedUser === email ? "bg-red-600/10 border-b-2 border-red-600" : "hover:bg-neutral-800/40"}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-2 h-2 rounded-full ${expandedUser === email ? "bg-red-600 shadow-[0_0_10px_#dc2626]" : "bg-neutral-800"}`}
                            />
                            <span
                              className={`font-black font-mono text-sm uppercase tracking-tighter italic ${expandedUser === email ? "text-red-500" : "text-neutral-400"}`}
                            >
                              USER_ID: {email}
                            </span>
                          </div>
                          <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest border-2 border-neutral-800 px-3 py-1 group-hover:border-red-600">
                            {expandedUser === email
                              ? "DISCONNECT_LOG"
                              : "ESTABLISH_LINK"}
                          </span>
                        </button>

                        {expandedUser === email && (
                          <div className="flex flex-col lg:flex-row min-h-87.5 animate-in fade-in zoom-in-95 duration-300">
                            <div className="lg:w-1/2 p-8 border-r-2 border-neutral-800 bg-black/60 flex flex-col justify-center relative">
                              <div className="absolute top-4 left-4 text-[7px] text-red-900 font-mono tracking-widest">
                                ENCRYPTED_DOSSIER
                              </div>
                              <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-600"></span>{" "}
                                Subject_Profile
                              </h4>
                              <div className="space-y-6">
                                <div className="border-l-4 border-red-600 pl-5 py-2 bg-red-600/5">
                                  <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest mb-1">
                                    Total_Deployments
                                  </p>
                                  <p className="text-4xl font-black font-mono text-white">
                                    {userOrders.length
                                      .toString()
                                      .padStart(2, "0")}
                                  </p>
                                </div>
                                <div className="border-l-4 border-neutral-800 pl-5 py-2">
                                  <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest mb-1">
                                    Accumulated_Value
                                  </p>
                                  <p className="text-2xl font-black font-mono text-green-500">
                                    ₱
                                    {userOrders
                                      .reduce(
                                        (a, b) => a + (b.total_price || 0),
                                        0,
                                      )
                                      .toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="lg:w-1/2 p-8 bg-neutral-900/10 flex flex-col border-t-2 border-neutral-800 lg:border-t-0">
                              <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-8 flex justify-between items-center">
                                <span>Order_History</span>
                                <span className="text-red-600 font-mono bg-red-600/10 px-2 py-0.5 border-2 border-red-600">
                                  PAGE_{orderPage}/{totalUserPages}
                                </span>
                              </h4>
                              <div className="grow flex flex-col space-y-5">
                                {currentOrders.map((order) => {
                                  const orderDate = order.created_at
                                    ? new Date(order.created_at)
                                    : new Date();

                                  return (
                                    <div
                                      key={order.id}
                                      className="border-b-2 border-neutral-900 pb-5 last:border-0 group"
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] font-mono text-neutral-600 bg-neutral-800/50 px-1 w-fit">
                                            TRX_ID:{" "}
                                            {String(order.id)
                                              .slice(0, 8)
                                              .toUpperCase()}
                                          </span>
                                          <span className="text-[8px] font-black text-red-600/70 uppercase tracking-tighter">
                                            T_STAMP:{" "}
                                            {orderDate.toLocaleDateString(
                                              "en-US",
                                            )}{" "}
                                            //{" "}
                                            {orderDate.toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: false,
                                            })}
                                            _HRS
                                          </span>
                                        </div>
                                        <span className="text-xs font-black text-white group-hover:text-red-500">
                                          ₱{order.total_price?.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="space-y-1.5 pl-2 border-l-2 border-red-600/20">
                                        {order.order_items?.map((item, idx) => (
                                          <div
                                            key={idx}
                                            className="text-[10px] text-neutral-400 font-bold uppercase flex justify-between"
                                          >
                                            <span>{item.products?.name}</span>
                                            <span className="text-red-600 font-mono">
                                              [{item.quantity}x]
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {totalUserPages > 1 && (
                                <div className="flex items-center justify-center mt-10">
                                  <div className="join border-2 border-neutral-800">
                                    <button
                                      disabled={orderPage === 1}
                                      onClick={() => setOrderPage((p) => p - 1)}
                                      className="join-item btn btn-xs bg-black text-white hover:bg-red-600 border-none"
                                    >
                                      «
                                    </button>
                                    <button className="join-item btn btn-xs bg-black text-neutral-500 border-none">
                                      P.{orderPage}
                                    </button>
                                    <button
                                      disabled={orderPage === totalUserPages}
                                      onClick={() => setOrderPage((p) => p + 1)}
                                      className="join-item btn btn-xs bg-black text-white hover:bg-red-600 border-none"
                                    >
                                      »
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
