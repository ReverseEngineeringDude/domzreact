
import React from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const Products = () => {
    const { products, loading, addToCart } = useShop();

    return (
        <section className="min-h-screen pt-32 pb-24 px-6 relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-40 left-0 w-96 h-96 bg-sage/5 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-stone-300/10 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
                    <h2 className="text-4xl md:text-6xl font-serif font-medium mb-4 text-charcoal">Curated Essence</h2>
                    <div className="h-1 w-20 bg-sage/30 mx-auto rounded-full" />
                    <p className="mt-4 text-charcoal/60 max-w-xl mx-auto">Our collection is small by design. We only produce what nature allows, ensuring every bottle is potent and pure.</p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center h-60 items-center"><Loader className="animate-spin text-sage w-8 h-8" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {products.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-charcoal/40">No essence found.</div>
                        ) : (
                            products.map((p, i) => (
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
