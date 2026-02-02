import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ShoppingBag, X, Plus, Minus, ArrowRight, Settings, Trash2, Upload, Loader, Lock, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth } from './assets/firebase';
import heroImage from './assets/hero-bottle.png';

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

const useCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { coupons, loading };
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

// 1. Floating Pill Navbar
const Navbar = ({ cartCount, onOpenCart }) => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, [lastScrollY]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: visible ? 20 : -100 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
    >
      <div className="glass-heavy rounded-full px-8 py-4 flex items-center gap-10 pointer-events-auto">
        <Link to="/" className="font-serif font-bold text-2xl tracking-tighter text-charcoal">
          Domz<span className="text-sage">.</span>
        </Link>

        <div className="h-4 w-[1px] bg-charcoal/10" />

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenCart}
            className="group relative flex items-center gap-2 text-sm font-medium text-charcoal/80 hover:text-sage transition-colors"
          >
            <span className="opacity-0 group-hover:opacity-100 absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest pointer-events-none transition-opacity">Bag</span>
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-sage text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

// 2. Immersive Hero with GSAP
const Hero = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Reveal Text
    tl.from(".hero-char", {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.05,
      ease: "power4.out"
    })
      .from(textRef.current.querySelectorAll("p, .badge"), {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.8")
      .from(imageRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: "expo.out"
      }, "-=1.0");

    // Parallax Effect on Scroll
    gsap.to(imageRef.current, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(textRef.current, {
      yPercent: -10,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-organic">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[60vw] h-[60vw] bg-sage/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vw] bg-pink-100/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Typography */}
        <div ref={textRef} className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left pt-20 lg:pt-0">
          <div className="mb-6 flex justify-center lg:justify-start">
            <span className="badge px-4 py-1.5 rounded-full border border-charcoal/10 text-[10px] uppercase tracking-[0.25em] text-charcoal/60 bg-white/40 backdrop-blur-md shadow-sm">Organic Collection 2026</span>
          </div>

          <h1 className="text-[13vw] lg:text-[8vw] leading-[0.85] font-serif font-medium text-charcoal mb-8 tracking-tighter overflow-hidden">
            <div className="flex justify-center lg:justify-start">
              {"Domz".split("").map((char, i) => <span key={i} className="hero-char inline-block">{char}</span>)}
            </div>
            <div className="flex justify-center lg:justify-start text-sage italic pr-4">
              {"Naturelle".split("").map((char, i) => <span key={i} className="hero-char inline-block">{char}</span>)}
            </div>
          </h1>

          <p className="text-lg md:text-xl text-charcoal/60 max-w-lg mx-auto lg:mx-0 font-light leading-relaxed mb-10">
            Discover the essence of purity. Curated skincare derived from the rarest botanicals, designed to make you feel weightless.
          </p>
        </div>

        {/* Visual Composition */}
        <div className="lg:col-span-5 relative h-[50vh] lg:h-[80vh] flex items-center justify-center">
          <div ref={imageRef} className="relative w-full max-w-md aspect-[3/4]">
            {/* Image Container */}
            <div className="absolute inset-4 rounded-t-[10rem] rounded-b-[4rem] overflow-hidden bg-white shadow-2xl z-10 border border-white/20">
              <img src={heroImage} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent mix-blend-multiply" />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -inset-2 border border-sage/30 rounded-t-[10rem] rounded-b-[4rem] z-0" />
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-50 animate-bounce-slow">
        <span className="text-[9px] uppercase tracking-[0.3em] text-charcoal">Scroll</span>
        <div className="w-[1px] h-12 bg-charcoal/20" />
      </div>
    </section>
  )
}

// 3. GSAP Enhanced Product Card
const ProductCard = ({ product, index, onAdd }) => {
  const cardRef = useRef(null);

  useGSAP(() => {
    // Scroll Reveal
    gsap.from(cardRef.current, {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top 90%", // Trigger when top of card hits 90% of viewport height
        toggleActions: "play none none reverse"
      }
    });
  }, { scope: cardRef });

  // Hover animations using GSAP context safely inside event handlers
  const onEnter = () => {
    gsap.to(cardRef.current.querySelector(".p-img"), { scale: 1.08, duration: 0.6, ease: "power2.out" });
    gsap.to(cardRef.current.querySelector(".p-btn"), { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
  };

  const onLeave = () => {
    gsap.to(cardRef.current.querySelector(".p-img"), { scale: 1, duration: 0.6, ease: "power2.out" });
    gsap.to(cardRef.current.querySelector(".p-btn"), { y: 20, opacity: 0, duration: 0.3, ease: "power2.in" });
  };

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col items-center ${index % 2 !== 0 ? "md:translate-y-12" : ""}`} // Staggered layout helper
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Image Area */}
      <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-xl mb-6 cursor-pointer border border-white/40">
        {product.image ? (
          <img
            src={product.image}
            className="p-img w-full h-full object-cover mix-blend-multiply"
            style={{ transform: "scale(1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal/20 bg-stone-100">No Image</div>
        )}

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none opacity-60" />

        {/* Quick Add Overlay */}
        <div
          onClick={(e) => { e.stopPropagation(); onAdd(product); }}
          className="p-btn absolute bottom-4 right-4 w-12 h-12 bg-charcoal text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-sage transition-colors opacity-0 translate-y-4"
        >
          <Plus className="w-5 h-5" />
        </div>
      </div>

      {/* Details */}
      <div className="text-center">
        <h3 className="text-2xl font-serif text-charcoal mb-1">{product.name}</h3>
        <p className="text-[10px] text-charcoal/40 uppercase tracking-[0.2em] mb-3 font-medium">Beauty Essence</p>
        <span className="text-lg font-medium text-sage">₹{product.price}</span>
      </div>
    </div>
  );
};


const Footer = () => (
  <footer className="py-8 text-center text-charcoal/30 text-xs font-sans font-medium uppercase tracking-widest border-t border-charcoal/5">
    <p>&copy; 2026 Domz Naturelle. Crafted with &hearts; by Domz.</p>
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
  const { products, loading: productsLoading } = useProducts();
  const { coupons, loading: couponsLoading } = useCoupons();

  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'coupons'

  // Product State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminNumber, setAdminNumber] = useState("8590985286");
  const [discountAmount, setDiscountAmount] = useState("");


  /* --- DEBUG LOGGING STATE --- */
  const [logs, setLogs] = useState([]);
  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

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

  const handleAddProduct = async (e) => {
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

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "coupons"), {
        code: couponCode.trim(),
        adminName,
        adminNumber,
        discountAmount: parseFloat(discountAmount),
        createdAt: serverTimestamp()
      });
      setCouponCode(""); setAdminName(""); setAdminNumber("8590985286"); setDiscountAmount("");
      alert("Coupon Created!");
    } catch (err) {
      alert("Error creating coupon: " + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Delete this essence?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (confirm("Delete this coupon?")) {
      try {
        await deleteDoc(doc(db, "coupons", id));
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
          <div onClick={() => setActiveTab("products")} className={cn("p-3 rounded-lg cursor-pointer transition-colors", activeTab === "products" ? "bg-white/20 text-white" : "text-white/50 hover:text-white hover:bg-white/5")}>Products</div>
          <div onClick={() => setActiveTab("coupons")} className={cn("p-3 rounded-lg cursor-pointer transition-colors", activeTab === "coupons" ? "bg-white/20 text-white" : "text-white/50 hover:text-white hover:bg-white/5")}>Coupons</div>
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

        {/* Mobile Tabs */}
        <div className="flex gap-4 mb-6 md:hidden">
          <button onClick={() => setActiveTab("products")} className={cn("px-4 py-2 rounded-full font-bold text-sm", activeTab === "products" ? "bg-charcoal text-white" : "bg-white text-charcoal")}>Products</button>
          <button onClick={() => setActiveTab("coupons")} className={cn("px-4 py-2 rounded-full font-bold text-sm", activeTab === "coupons" ? "bg-charcoal text-white" : "bg-white text-charcoal")}>Coupons</button>
        </div>

        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Product Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 sticky top-8">
                <h3 className="text-lg font-bold text-charcoal mb-4">Add New Essence</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
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
              {productsLoading ? <div className="text-center py-10"><Loader className="animate-spin inline-block text-charcoal/30" /></div> : (
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
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "coupons" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Coupon Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 sticky top-8">
                <h3 className="text-lg font-bold text-charcoal mb-4">Add Coupon</h3>
                <form onSubmit={handleAddCoupon} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider block mb-1">Coupon Code</label>
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="e.g. SALE50" required className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-sage" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider block mb-1">Admin Name</label>
                    <input value={adminName} onChange={e => setAdminName(e.target.value)} required className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-sage" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider block mb-1">Admin Phone Number</label>
                    <input value={adminNumber} onChange={e => setAdminNumber(e.target.value)} required className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-sage" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider block mb-1">Discount Amount (₹)</label>
                    <input type="number" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} required className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-sage" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-charcoal text-white font-bold rounded-lg hover:bg-sage transition-colors">Create Coupon</button>
                </form>
              </div>
            </div>

            {/* Coupon List */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-charcoal mb-4">Active Coupons ({coupons.length})</h3>
              {couponsLoading ? <div className="text-center py-10"><Loader className="animate-spin inline-block text-charcoal/30" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-charcoal">{c.code}</h4>
                        <p className="text-xs text-charcoal/50">Admin: {c.adminName} ({c.adminNumber})</p>
                        <p className="text-sage font-bold font-xs">Discount: ₹{c.discountAmount}</p>
                      </div>
                      <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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

// --- Checkout Modal ---
const CheckoutModal = ({ isOpen, onClose, onConfirm, initialData, coupons }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    city: initialData.city || "",
    zip: initialData.zip || ""
  });

  // Coupon inputs
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCode.trim();
    if (!code) return;

    // Find coupon in coupons list (case sensitive or not? usually case sensitive or uppercase)
    const found = coupons.find(c => c.code === code);
    if (found) {
      setAppliedCoupon(found);
    } else {
      setCouponError("Invalid Coupon Code");
      setAppliedCoupon(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill in required fields.");
      return;
    }
    onConfirm(formData, appliedCoupon);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50"
      >
        <div className="p-6 border-b border-charcoal/5 flex justify-between items-center bg-stone-50/50">
          <h3 className="text-xl font-serif font-bold text-charcoal">Shipping & Offers</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-200/50 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Form Fields */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-charcoal/40 uppercase tracking-widest">Your Details</h4>
            <input name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
            <input name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
            <input name="address" placeholder="Address *" value={formData.address} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
            <div className="grid grid-cols-2 gap-4">
              <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
              <input name="zip" placeholder="ZIP Code" value={formData.zip} onChange={handleChange} className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none transition-colors" />
            </div>
          </div>

          <div className="h-[1px] bg-charcoal/5 w-full" />

          {/* Coupon Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-charcoal/40 uppercase tracking-widest">Have a Coupon?</h4>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter Code"
                className="flex-1 p-4 bg-white border border-stone-200 rounded-xl focus:border-sage outline-none uppercase tracking-wider placeholder:normal-case"
              />
              <button onClick={handleApplyCoupon} type="button" className="px-6 bg-charcoal text-white rounded-xl hover:bg-sage transition-colors font-medium text-sm">Apply</button>
            </div>

            {couponError && <p className="text-red-500 text-sm pl-1">{couponError}</p>}

            {appliedCoupon && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-sage/10 rounded-xl border border-sage/20 flex justify-between items-center text-sage-dark">
                <div>
                  <span className="font-bold block text-charcoal">Coupon Applied!</span>
                  <span className="text-xs">Saving ₹{appliedCoupon.discountAmount}</span>
                </div>
                <CheckCircle className="w-5 h-5 text-sage" /> {/* Assuming CheckCircle is available or use standard check */}
              </motion.div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-charcoal/5 bg-stone-50/50 flex justify-end gap-4">
          {!appliedCoupon && <span className="text-xs text-charcoal/40 self-center">No coupon applied</span>}
          <button onClick={handleSubmit} className="px-8 py-3 bg-charcoal text-white font-bold rounded-xl hover:bg-sage transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Confirm & Order
          </button>
        </div>
      </motion.div>

    </motion.div>
  )
}

const StorePage = () => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('domz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { products, loading } = useProducts();
  const { coupons } = useCoupons(); // Load coupons for user to check

  // Load saved shipping details
  const [shippingDetails, setShippingDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('domz_shipping');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

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

  const initiateCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false); // Close cart drawer
    setIsCheckoutOpen(true); // Open shipping modal
  };

  const handleFinalCheckout = (formData, appliedCoupon) => {
    // Save details
    setShippingDetails(formData);
    localStorage.setItem('domz_shipping', JSON.stringify(formData));
    setIsCheckoutOpen(false);

    // Calculate Final Total
    let finalTotal = total;
    let discountMsg = "";
    if (appliedCoupon && appliedCoupon.discountAmount) {
      finalTotal = Math.max(0, total - appliedCoupon.discountAmount);
      discountMsg = `(Discounted from ₹${total} by Coupon ${appliedCoupon.code})`;
    }

    // Determine WhatsApp Number - ALWAYS OWNER
    const targetNumber = "8590985286";

    // Header
    let msg = `Hello Domz Naturelle, I would like to place an order:%0a%0a`;

    // Items
    cart.forEach(item => {
      msg += `Item: ${item.name}%0a`;
      msg += `Qty: ${item.quantity}%0a`;
      msg += `Price: ₹${item.price} %0a`;
      msg += `--------------------------------%0a`;
    });

    // Footer
    msg += `%0a*Total Price: ₹${finalTotal}* ${discountMsg}%0a`;

    // Shipping Details
    msg += `%0a*Shipping Details:*%0a`;
    msg += `Name: ${formData.name}%0a`;
    msg += `Phone: ${formData.phone}%0a`;
    msg += `Address: ${formData.address}%0a`;
    if (formData.city) msg += `City: ${formData.city}%0a`;
    if (formData.zip) msg += `ZIP: ${formData.zip}%0a`;

    if (appliedCoupon) {
      msg += `%0a*Coupon Applied:* ${appliedCoupon.code}%0a`;
      msg += `Coupon Admin name : ${appliedCoupon.adminName}%0a`;
      msg += `ADMIN Contact Number: ${appliedCoupon.adminNumber}%0a`;
    }

    window.open(`https://wa.me/91${targetNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-bone font-serif text-charcoal selection:bg-sage/20 overflow-x-hidden">
      <Navbar cartCount={cart.reduce((a, b) => a + b.quantity, 0)} onOpenCart={() => setIsCartOpen(true)} />

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onConfirm={handleFinalCheckout}
            initialData={shippingDetails}
            coupons={coupons}
          />
        )}
      </AnimatePresence>

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
                <button onClick={initiateCheckout} className="w-full py-4 bg-charcoal text-white rounded-xl hover:bg-sage transition-colors">Checkout WhatsApp</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}


export default function App() {
  return (
    <HashRouter>
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
    </HashRouter>
  );
}
