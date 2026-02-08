
import React from 'react';
import { motion } from 'framer-motion';

import SEO from '../components/SEO';

const About = () => {
    return (
        <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden">
            <SEO title="The Philosophy" description="Learn about the philosophy behind Domz Naturelle. Nature is not an ingredient, it is the formula." url="/about" />
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-sage/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vw] bg-stone-200/40 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-12">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <span className="text-xs font-bold text-sage uppercase tracking-[0.3em] mb-4 block">The Philosophy</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-charcoal mb-8 leading-tight">Nature is not an ingredient. <br /><span className="italic text-charcoal/40">It is the formula.</span></h1>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-lg md:text-xl text-charcoal/70 leading-relaxed font-light">
                    Domz Naturelle was born from a simple observation: skincare had become complicated. We stripped away the synthetics, the fillers, and the noise using only what the earth provides.
                </motion.p>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="text-lg md:text-xl text-charcoal/70 leading-relaxed font-light">
                    Our botanicals are sourced from sustainable micro-farms where the soil is untouched by heavy machinery. Every bottle is filled by hand, ensuring that the integrity of the essence remains compromised.
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }} className="pt-12">
                    <div className="h-[1px] w-24 bg-charcoal/20 mx-auto mb-8" />
                    <p className="font-serif text-2xl italic text-charcoal">"To wear Domz is to wear the earth itself."</p>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
