
import React from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Loader } from 'lucide-react';
import { motion } from 'framer-motion';

import SEO from '../components/SEO';

const Products = () => {
    const { products, loading, addToCart } = useShop();
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredProducts = products.filter(p => 
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="min-h-screen pt-32 pb-24 px-6 relative">
            <SEO title="Our Collection" description="Explore our curated collection of organic skincare products. Limited edition, pure, and potent." url="/products" />
            {/* Ambient Background Elements */}
            <div className="absolute top-40 left-0 w-96 h-96 bg-sage/5 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-stone-300/10 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-serif font-medium mb-4 text-charcoal">Curated Essence</h2>
                    <div className="h-1 w-20 bg-sage/30 mx-auto rounded-full mb-8" />
                    
                    {/* Search Bar */}
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Search our collection..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-8 py-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-charcoal/5 outline-none focus:border-sage/30 transition-all text-sm font-medium tracking-wide placeholder:text-charcoal/20 shadow-sm"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-sage/60 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center h-60 items-center"><Loader className="animate-spin text-sage w-8 h-8" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-charcoal/40 font-serif italic text-xl">
                                No essence matches "{searchQuery}"
                            </div>
                        ) : (
                            filteredProducts.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} onAdd={addToCart} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Products;
