
import React, { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../assets/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate, Navigate } from 'react-router-dom';
import { LogOut, Loader, Upload, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const Admin = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Data State
    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [couponsLoading, setCouponsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("products");

    // Product Form State
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [desc, setDesc] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [logs, setLogs] = useState([]);

    // Coupon Form State
    const [couponCode, setCouponCode] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminNumber, setAdminNumber] = useState("8590985286");
    const [discountAmount, setDiscountAmount] = useState("");

    const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    // Auth Check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (!currentUser) navigate('/login');
        });
        return unsubscribe;
    }, [navigate]);

    // Fetch Products
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setProductsLoading(false);
        });
        return unsubscribe;
    }, [user]);

    // Fetch Coupons
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setCouponsLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const logout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

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
            const base64String = await compressImage(imageFile);
            addLog("Image compressed & encoded.");

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

    if (loading) return <div className="min-h-screen bg-bone flex items-center justify-center"><Loader className="animate-spin text-sage w-10 h-10" /></div>;
    if (!user) return <div className="text-center p-10">Redirecting...</div>;

    return (
        <div className="min-h-screen bg-stone-100 font-sans flex relative">
            <SEO title="Admin Dashboard" noIndex={true} />
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
    );
};

export default Admin;
