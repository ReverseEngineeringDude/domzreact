
import React, { useRef } from 'react';
import { Plus } from 'lucide-react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

        // Hover Animations (Desktop Only)
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px)", () => {
            // Initial state for desktop is hidden (handled by CSS or set here)
            gsap.set(cardRef.current.querySelector(".p-btn"), { y: 20, opacity: 0 });
        });

    }, { scope: cardRef });

    // Hover animations using GSAP context safely inside event handlers
    const onEnter = () => {
        if (window.innerWidth >= 1024) {
            gsap.to(cardRef.current.querySelector(".p-img"), { scale: 1.08, duration: 0.6, ease: "power2.out" });
            gsap.to(cardRef.current.querySelector(".p-btn"), { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
        }
    };

    const onLeave = () => {
        if (window.innerWidth >= 1024) {
            gsap.to(cardRef.current.querySelector(".p-img"), { scale: 1, duration: 0.6, ease: "power2.out" });
            gsap.to(cardRef.current.querySelector(".p-btn"), { y: 20, opacity: 0, duration: 0.3, ease: "power2.in" });
        }
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
                    className="p-btn absolute bottom-4 right-4 w-12 h-12 bg-charcoal text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-sage transition-colors opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-4"
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

export default ProductCard;
