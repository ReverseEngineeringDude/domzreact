
import React, { useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useShop } from '../context/ShopContext';

gsap.registerPlugin(ScrollTrigger);

const ProductEdit = ({ products }) => {
    const { addToCart } = useShop();
    const containerRef = useRef(null);

    useGSAP(() => {
        const images = containerRef.current.querySelectorAll('.parallax-img');

        images.forEach((img, i) => {
            gsap.to(img, {
                yPercent: i % 2 === 0 ? 10 : -10,
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

    }, { scope: containerRef });

    // Take only the first 3-4 products for this curated edit to keep it minimal
    const curatedProducts = products.slice(0, 4);

    return (
        <section ref={containerRef} className="py-32 px-6 bg-bone overflow-hidden">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-charcoal/10 pb-8">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-sage mb-4 block">The Edit</span>
                        <h2 className="text-5xl md:text-7xl font-serif text-charcoal">Curated Essentials</h2>
                    </div>
                    <div className="mt-8 md:mt-0">
                        <Link to="/products" className="text-xs font-bold uppercase tracking-[0.2em] text-charcoal/60 hover:text-charcoal transition-colors decoration-1 underline-offset-4 hover:underline">
                            View Full Collection
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16">
                    {curatedProducts.map((product, index) => {
                        // Asymmetric layout logic
                        const colSpan = index === 0 ? "md:col-span-8"
                            : index === 1 ? "md:col-span-4 md:mt-32"
                                : index === 2 ? "md:col-span-5 md:-mt-20"
                                    : "md:col-span-7 md:mt-24";

                        const aspectRatio = index === 0 ? "aspect-[16/9]" : "aspect-[3/4]";

                        return (
                            <div key={product.id} className={`${colSpan} group relative`}>
                                <div className={`overflow-hidden w-full ${aspectRatio} bg-stone-100 mb-6 relative group transform transition-transform`}>
                                    <div className="parallax-img w-full h-[120%] -y-[10%] pointer-events-none">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/5 transition-colors duration-500" />

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="absolute bottom-6 right-6 w-12 h-12 bg-white text-charcoal rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-sage hover:text-white shadow-lg z-20 cursor-pointer"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-baseline pr-4">
                                    <div>
                                        <h3 className="text-2xl font-serif text-charcoal mb-1">{product.name}</h3>
                                        <span className="text-xs uppercase tracking-widest text-charcoal/50">Pure Organic</span>
                                    </div>
                                    <span className="text-lg font-light text-charcoal">₹{product.price}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ProductEdit;
