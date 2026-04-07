
import React, { useRef } from 'react';
import { Plus } from 'lucide-react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

import { Link } from 'react-router-dom';

const ProductCard = ({ product, index, onAdd }) => {
    const cardRef = useRef(null);
    const isShowcase = !onAdd;

    useGSAP(() => {
        // Scroll Reveal
        gsap.from(cardRef.current, {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: cardRef.current,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });

        // Hover Animations (Desktop Only)
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px)", () => {
            if (isShowcase) {
                // For showcase, maybe just a slight lift?
                gsap.set(cardRef.current.querySelector(".p-hint"), { y: 10, opacity: 0 });
            } else {
                gsap.set(cardRef.current.querySelector(".p-btn"), { y: 20, opacity: 0 });
            }
        });

    }, { scope: cardRef });

    const onEnter = () => {
        if (window.innerWidth >= 1024) {
            gsap.to(cardRef.current.querySelector(".p-img"), { scale: 1.05, duration: 0.8, ease: "power2.out" });
            if (isShowcase) {
                gsap.to(cardRef.current.querySelector(".p-hint"), { y: 0, opacity: 1, duration: 0.4 });
            } else {
                gsap.to(cardRef.current.querySelector(".p-btn"), { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
            }
        }
    };

    const onLeave = () => {
        if (window.innerWidth >= 1024) {
            gsap.to(cardRef.current.querySelector(".p-img"), { scale: 1, duration: 0.8, ease: "power2.out" });
            if (isShowcase) {
                gsap.to(cardRef.current.querySelector(".p-hint"), { y: 10, opacity: 0, duration: 0.3 });
            } else {
                gsap.to(cardRef.current.querySelector(".p-btn"), { y: 20, opacity: 0, duration: 0.3, ease: "power2.in" });
            }
        }
    };

    const Content = (
        <div
            className={`group relative flex flex-col items-center ${index % 2 !== 0 ? "md:translate-y-12" : ""}`}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            {/* Image Area */}
            <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-xl mb-6 cursor-pointer border border-white/40">
                {product.image ? (
                    <img
                        src={product.image}
                        className="p-img w-full h-full object-cover mix-blend-multiply transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal/20 bg-stone-100 italic font-serif">Pure Essence</div>
                )}

                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none opacity-40" />

                {/* Interaction Overlay */}
                {!isShowcase ? (
                    <div
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(product); }}
                        className="p-btn absolute bottom-6 right-6 w-12 h-12 bg-charcoal text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-sage transition-all duration-300 transform lg:opacity-0 lg:translate-y-4"
                    >
                        <Plus className="w-5 h-5" />
                    </div>
                ) : (
                    <div className="p-hint absolute inset-0 flex items-center justify-center bg-charcoal/5 backdrop-blur-[2px] opacity-0 transition-opacity duration-500">
                        <span className="bg-white/90 text-charcoal px-6 py-2 rounded-full text-[10px] uppercase tracking-[.2em] font-bold shadow-xl border border-white/20">View Collection</span>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="text-center">
                <span className="text-[9px] text-sage font-black uppercase tracking-[0.3em] mb-2 block">Available Ritual</span>
                <h3 className="text-2xl font-serif text-charcoal mb-1 leading-tight">{product.name}</h3>
                <p className="text-[10px] text-charcoal/30 uppercase tracking-[0.1em] mb-3 font-medium">Small Batch Bottling</p>
                <span className="text-lg font-medium text-sage/80 italic font-serif">₹{product.price}</span>
            </div>
        </div>
    );

    return (
        <div ref={cardRef}>
            {isShowcase ? (
                <Link to="/products" className="block cursor-pointer">
                    {Content}
                </Link>
            ) : Content}
        </div>
    );
};

export default ProductCard;
