
import React, { useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { useShop } from '../context/ShopContext';

const Preloader = () => {
    const containerRef = useRef(null);
    const { setAppLoaded } = useShop();

    useGSAP(() => {
        const tl = gsap.timeline({
            onComplete: () => setAppLoaded(true)
        });

        tl.to(".loader-text", {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.2
        })
            .to(".loader-text", {
                opacity: 0,
                y: -20,
                duration: 0.5,
                ease: "power2.in",
                delay: 0.5
            })
            .to(containerRef.current, {
                yPercent: -100,
                duration: 1,
                ease: "power4.inOut"
            });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="fixed inset-0 z-[9999] bg-charcoal flex items-center justify-center text-bone">
            <h1 className="loader-text font-serif text-4xl md:text-6xl font-bold opacity-0 translate-y-10">Domz.</h1>
        </div>
    )
}

export default Preloader;
