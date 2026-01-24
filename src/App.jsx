import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, ArrowRight, Settings, Trash2, Upload, Loader, Lock, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { db, storage, auth } from './assets/firebase';
import heroImage from './assets/hero-bottle.png';

// --- Utils ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

// --- Hooks ---
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { products, loading };
};

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return { user, loading, login, logout };
};

// --- Shared Components ---
const MagneticButton = ({ children, className, onClick, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    {children}
  </motion.button>
);

// --- Pages & Components ---
// ... (Navbar, Hero, Footer, StoreLayout components remain largely the same visually)

// Re-using Navbar/Hero/Footer structure to ensure concise file
const Navbar = ({ cartCount, onOpenCart }) => {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const blur = useTransform(scrollY, [0, 100], ["0px", "12px"]);

  return (
    <motion.nav
      style={{ backgroundColor: `rgba(249, 246, 240, ${bgOpacity})`, backdropFilter: `blur(${blur})` }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 flex justify-between items-center transition-colors duration-500 border-b border-transparent hover:border-charcoal/5"
    >
      <Link to="/">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold tracking-tighter text-charcoal">
          Domz Naturelle
        </motion.h1>
      </Link>
      <div className="flex gap-4 items-center">
        {/* Admin Link Hidden: Access via /admin manually */}
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={onOpenCart} className="relative p-3 rounded-full bg-white/40 border border-white/60 shadow-sm backdrop-blur-md">
          <ShoppingBag className="w-5 h-5 text-charcoal" />
          {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-sage text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{cartCount}</span>}
        </motion.button>
      </div>
    </motion.nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, 150]);
  const yImage = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-r from-sage/20 to-stone-200/20 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.5, 1], rotate: [0, -45, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-l from-sage/10 to-charcoal/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text Side - Glass Card */}
        <motion.div style={{ y: yText, opacity }} className="relative">
          <div className="absolute -inset-4 bg-white/30 backdrop-blur-xl rounded-[2rem] -z-10 border border-white/50 shadow-2xl skew-y-1" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-8 md:p-12">
            <span className="inline-block py-2 px-4 bg-charcoal text-white rounded-full text-xs uppercase tracking-[0.3em] mb-8 font-sans shadow-lg">Est. 2026</span>
            <h2 className="text-6xl md:text-8xl font-bold text-charcoal mb-6 tracking-tight leading-[0.9] font-serif">
              Zero <br />
              <span className="italic font-light text-sage/90 relative">
                Gravity
                <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5 }} className="absolute -bottom-2 left-0 w-full h-3 text-sage" viewBox="0 0 100 10"><path d="M0 5 Q 50 10 100 5" fill="transparent" stroke="currentColor" strokeWidth="2" /></motion.svg>
              </span>
            </h2>
            <p className="text-lg md:text-xl text-charcoal/70 max-w-lg leading-relaxed font-light mb-10 border-l-2 border-sage pl-6">
              Experience skincare that feels lighter than air. Pure, organic essence lifted by nature.
            </p>
            <div className="flex gap-4">
              <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="px-8 py-4 bg-charcoal text-white font-medium rounded-full hover:bg-sage transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2">
                Explore Collection <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Image Side - Floating Composition */}
        <motion.div style={{ y: yImage, opacity }} className="relative hidden md:block">
          <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative z-20">
            <div className="relative aspect-square rounded-full border border-white/40 bg-white/10 backdrop-blur-md p-8 shadow-2xl ring-1 ring-white/60">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-stone-100 to-white flex items-center justify-center overflow-hidden relative">
                <img src={heroImage} alt="Luxury Skin Essence" className="w-[120%] h-[120%] object-cover mix-blend-multiply opacity-90 scale-110" />
              </div>
            </div>
          </motion.div>

          {/* Floating Orbiting Elements */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-sage/20 rounded-full -z-10 dotted-border" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-charcoal/5 rounded-full -z-10" />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-charcoal/30 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-charcoal/30 to-transparent" />
      </motion.div>
    </section>
  )
}


const Footer = () => (
  <footer className="py-8 text-center text-charcoal/30 text-xs font-sans font-medium uppercase tracking-widest border-t border-charcoal/5">
    <p>&copy; 2026 Domz Naturelle. Crafted with &hearts; and Gravity.</p>
  </footer>
);

// --- Login Page ---
const LoginPage = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/admin');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(email, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-bone flex items-center justify-center font-sans relative overflow-hidden">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-sage/20 rounded-full blur-[100px]" />

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 w-full max-w-md p-8 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-charcoal/5 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-charcoal" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-charcoal">Control Center</h2>
          <p className="text-charcoal/50">Authenticate to manage essence.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-red-500 bg-red-50 rounded-lg text-sm text-center">{error}</div>}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-white/60 border border-transparent focus:border-sage outline-none transition-all placeholder:text-charcoal/30" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-white/60 border border-transparent focus:border-sage outline-none transition-all placeholder:text-charcoal/30" />

          <button type="submit" className="w-full py-4 bg-charcoal text-white font-medium rounded-xl hover:bg-sage transition-colors shadow-lg">
            Access Dashboard
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-charcoal/30 uppercase tracking-widest">
          <Link to="/" className="hover:text-sage transition-colors">← Return to Gravity</Link>
        </div>
      </motion.div>
    </div>
  )
}

// --- Admin Dashboard ---
const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const { products, loading } = useProducts();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [corsError, setCorsError] = useState(false); // New State

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* --- DEBUG LOGGING STATE --- */
  const [logs, setLogs] = useState([]);
  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  /* --- IMAGE PROCESSING --- */
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Limit size to avoid Firestore 1MB cap
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Compress to JPEG at 0.7 quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageFile) { alert("Please select an image"); return; }
    if (!user) { alert("You must be logged in!"); return; }

    setUploading(true);
    setLogs([]);
    addLog("Processing image (Base64 Mode)...");

    try {
      // 1. Compress Image (Run client-side, no upload)
      const base64String = await compressImage(imageFile);
      addLog("Image compressed & encoded.");

      // 2. Save to Firestore
      addLog("Saving to Database...");
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        description: desc,
        image: base64String, // Saving text directly
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      setName(""); setPrice(""); setDesc(""); setImageFile(null); setPreviewUrl(null);
      addLog("SUCCESS! Product saved to database.");
      alert("Product published!");

    } catch (err) {
      console.error("Save Error:", err);
      addLog(`ERROR: ${err.message}`);
      alert("Failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this essence?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (e) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans flex relative">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal text-white p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
        <h2 className="text-2xl font-serif font-bold mb-10">Domz Admin</h2>
        <div className="text-xs opacity-50 mb-4">User: {user?.email}</div>
        <nav className="flex-1 space-y-2">
          <div className="p-3 bg-white/10 rounded-lg cursor-pointer">Products</div>
        </nav>
        <button onClick={logout} className="flex items-center gap-2 text-white/50 hover:text-white mt-auto">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 md:hidden">
          <h1 className="text-2xl font-bold text-charcoal">Dashboard</h1>
          <button onClick={logout}><LogOut className="w-5 h-5 text-charcoal" /></button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 sticky top-8">
              <h3 className="text-lg font-bold text-charcoal mb-4">Add New Essence</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider block mb-1">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-sage" />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider block mb-1">Price</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-sage" />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider block mb-1">Description</label>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows={3} className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-sage" />
                </div>

                <div className="p-4 border-2 border-dashed border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-center cursor-pointer relative overflow-hidden">
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {previewUrl ? (
                    <div className="relative z-0">
                      <img src={previewUrl} className="w-full h-32 object-cover rounded-lg" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold">Change Image</div>
                    </div>
                  ) : (
                    <div className="text-charcoal/40 text-xs flex flex-col items-center gap-2 py-4"><Upload className="w-6 h-6" /> Upload to Storage</div>
                  )}
                </div>

                <button disabled={uploading} type="submit" className="w-full py-3 bg-charcoal text-white font-bold rounded-lg hover:bg-sage transition-colors disabled:opacity-50">
                  {uploading ? "Uploading..." : "Publish Product"}
                </button>
              </form>

              {/* Debug Logs */}
              {logs.length > 0 && (
                <div className="mt-6 p-4 bg-black/5 rounded-lg text-xs font-mono text-charcoal/80 max-h-40 overflow-y-auto border border-charcoal/10">
                  <div className="font-bold mb-2">Debug Console</div>
                  {logs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
              )}
            </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-charcoal mb-4">Inventory ({products.length})</h3>
            {loading ? <div className="text-center py-10"><Loader className="animate-spin inline-block text-charcoal/30" /></div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(p => (
                  <motion.div layout key={p.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4 group">
                    <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-100">
                      {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-charcoal truncate">{p.name}</h4>
                      <p className="text-xs text-charcoal/50 line-clamp-1">{p.description}</p>
                      <p className="text-sage font-bold mt-1">₹{p.price}</p>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-bone flex items-center justify-center"><Loader className="animate-spin text-sage w-10 h-10" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const StorePage = () => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('domz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { products, loading } = useProducts();

  useEffect(() => {
    localStorage.setItem('domz_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Calculate total for rendering
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    // Header
    let msg = `Hello Domz Naturelle, I would like to place an order:%0a%0a`;

    // Items
    cart.forEach(item => {
      msg += `Item: ${item.name}%0a`;
      msg += `Qty: ${item.quantity}%0a`;
      msg += `Price: ₹${item.price} ea%0a`;
      msg += `--------------------------------%0a`;
    });

    // Footer
    msg += `%0a*Total Price: ₹${total}*`;

    window.open(`https://wa.me/918590319003?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-bone font-serif text-charcoal selection:bg-sage/20 overflow-x-hidden">
      <Navbar cartCount={cart.reduce((a, b) => a + b.quantity, 0)} onOpenCart={() => setIsCartOpen(true)} />
      <main>
        <Hero />
        <section className="px-6 py-32 md:px-12 max-w-7xl mx-auto relative">
          {/* Ambient Background Elements */}
          <div className="absolute top-40 left-0 w-96 h-96 bg-sage/5 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-stone-300/10 rounded-full blur-[120px] -z-10" />

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24 text-center">
            <h3 className="text-4xl md:text-6xl font-serif font-medium mb-4">Curated Essence</h3>
            <div className="h-1 w-20 bg-sage/30 mx-auto rounded-full" />
          </motion.div>

          {loading ? <div className="flex justify-center"><Loader className="animate-spin text-sage w-8 h-8" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 pl-2 pr-2">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onAdd={addToCart} />
              ))}
            </div>
          )}
        </section>
        <section className="py-20 md:py-40 flex flex-col items-center justify-center text-center px-4 relative">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h3 className="text-5xl md:text-8xl font-serif font-bold mb-8 text-charcoal/90">Pure. Organic. You.</h3>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-10 py-4 rounded-full border border-charcoal/20 hover:bg-charcoal hover:text-white transition-all uppercase tracking-widest text-xs">Levitate to Top</button>
          </motion.div>
        </section>
      </main>
      <Footer />

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30 }} className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-bone z-[60] p-8 flex flex-col shadow-2xl">
              <div className="flex justify-between mb-8"><h2 className="text-2xl font-bold">Bag</h2><button onClick={() => setIsCartOpen(false)}><X /></button></div>
              <div className="flex-1 overflow-y-auto space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center bg-white/50 p-3 rounded-xl">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden">{item.image && <img src={item.image} className="w-full h-full object-cover" />}</div>
                    <div className="flex-1"><div className="font-bold">{item.name}</div><div className="text-sage">₹{item.price}</div></div>
                    <div className="flex items-center gap-2"><button onClick={() => updateQuantity(item.id, -1)}><Minus className="w-4" /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}><Plus className="w-4" /></button></div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-charcoal/10">
                <div className="flex justify-between text-xl font-bold mb-6"><span>Total</span><span>₹{total}</span></div>
                <button onClick={handleCheckout} className="w-full py-4 bg-charcoal text-white rounded-xl hover:bg-sage transition-colors">Checkout WhatsApp</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

const ProductCard = ({ product, index, onAdd }) => {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 100, filter: "blur(10px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, delay: index * 0.1 } } }}
      whileHover={{ y: -20, scale: 1.02 }}
      className={cn("group relative flex flex-col h-full", isEven ? "md:mt-0" : "md:mt-24")}
    >
      {/* Glass Container */}
      <div className="relative aspect-[3/4] mb-6 rounded-[2rem] overflow-hidden bg-white/20 border border-white/40 shadow-xl transition-all duration-700 group-hover:shadow-2xl group-hover:border-white/60 group-hover:bg-white/30 backdrop-blur-sm">

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-black/5 z-10 pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity" />

        {/* Product Image */}
        {product.image ? (
          <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-multiply opacity-90 group-hover:opacity-100" />
        ) : (
          <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">No Image</div>
        )}

        {/* Floating Add Button */}
        <motion.button
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onAdd(product); }}
          className="absolute bottom-6 right-6 w-14 h-14 bg-white/70 backdrop-blur-md border border-white text-charcoal rounded-full flex items-center justify-center shadow-lg z-20 group-hover:bg-sage group-hover:text-white transition-colors duration-300"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Text Content */}
      <div className="px-4 py-2 relative">
        <motion.div initial={{ x: -10, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="absolute -left-2 top-0 bottom-0 w-1 bg-sage/30 rounded-full scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />

        <h3 className="text-3xl font-serif font-medium text-charcoal mb-2 tracking-tight group-hover:text-sage transition-colors">{product.name}</h3>
        <p className="text-sm text-charcoal/60 mb-4 font-sans font-light leading-relaxed line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-charcoal">₹{product.price}</span>
          <button onClick={() => onAdd(product)} className="text-xs uppercase tracking-widest text-charcoal/40 hover:text-sage border-b border-transparent hover:border-sage transition-all">Add to Bag</button>
        </div>
      </div>
    </motion.div>
  );
};


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StorePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
