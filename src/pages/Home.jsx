
import React, { useRef, useEffect } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import heroImage from '../assets/hero-bottle.png';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);



import { useShop } from '../context/ShopContext';
import ProductEdit from '../components/ProductEdit';




const Home = () => {
    const { products } = useShop();
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const imageRef = useRef(null);
    const marqueeRef = useRef(null);
    const manifestoRef = useRef(null);


    useGSAP(() => {
        const tl = gsap.timeline();

        // 1. Hero Reveal
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

        // 2. Parallax Effect on Scroll (Hero)
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

        // 3. Marquee Animation
        const marqueeContent = marqueeRef.current.querySelector(".marquee-content");
        if (marqueeContent) {
            gsap.to(marqueeContent, {
                xPercent: -50,
                ease: "none",
                duration: 20,
                repeat: -1
            });
        }

        // 4. Manifesto Text Reveal
        const words = manifestoRef.current.querySelectorAll(".word");
        gsap.fromTo(words,
            { opacity: 0.1, y: 20 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.02,
                scrollTrigger: {
                    trigger: manifestoRef.current,
                    start: "top 80%",
                    end: "bottom 60%",
                    scrub: 1
                }
            }
        );

        // 5. Floating Blobs Parallax
        gsap.utils.toArray(".floating-blob").forEach((blob, i) => {
            gsap.to(blob, {
                y: (i + 1) * -50,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                }
            });
        });



    }, { scope: containerRef, dependencies: [products] });

    return (
        <main ref={containerRef} className="overflow-hidden">
            {/* Grain Overlay */}
            <div className="grain-overlay" />

            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-organic">
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
            </section>

            {/* Infinite Marquee Section */}
            <section ref={marqueeRef} className="py-20 border-y border-charcoal/5 bg-white/50 backdrop-blur-sm overflow-hidden whitespace-nowrap relative z-10">
                <div className="marquee-content inline-flex items-center gap-24 pl-4">
                    {[...Array(6)].map((_, i) => (
                        <React.Fragment key={i}>
                            <span className="text-5xl md:text-8xl font-serif text-charcoal/10 font-light italic">Naturelle</span>
                            <span className="text-xs font-bold tracking-[0.3em] uppercase text-sage">Est. 2026</span>
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* Manifesto Section (Refined) */}
            <section className="py-32 md:py-48 px-6 min-h-[90vh] flex items-center justify-center relative bg-stone-50">
                <div ref={manifestoRef} className="max-w-5xl mx-auto text-center leading-tight relative z-10">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-charcoal/40 mb-12">The Philosophy</p>
                    {"We believe that true beauty is found in the untouched code of nature. No synthetics. No fillers. Just the raw, potent energy of earth, bottled for your skin.".split(" ").map((word, i) => (
                        <span key={i} className="word inline-block mr-[0.25em] text-4xl md:text-7xl font-serif text-charcoal tracking-tight">{word}</span>
                    ))}
                </div>
            </section>



            {/* Product Edit */}
            <ProductEdit products={products} />

            <section className="py-32 flex flex-col items-center justify-center text-center px-4 relative bg-stone-100">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                    <h3 className="text-5xl md:text-8xl font-serif font-medium mb-12 text-charcoal/90 tracking-tighter">Pure. Organic. You.</h3>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-10 py-4 rounded-full border border-charcoal/20 hover:bg-charcoal hover:text-white transition-all uppercase tracking-widest text-xs">Levitate to Top</button>
                </motion.div>
            </section>




        </main>
    );
};

export default Home;
