
import React from 'react';
import { Instagram, Facebook, Phone, Mail, MessageCircle, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-charcoal text-bone pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="text-center md:text-left space-y-4">
                        <div className="mb-4">
                            <img src="/domz_logo_no_bg.png" alt="Domz Naturelle" className="h-12 w-auto mx-auto md:mx-0 invert brightness-0" />
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                            Curating nature's finest essences for your daily ritual. Pure, organic, and timeless skincare designed to elevate your being.
                        </p>
                    </div>

                    {/* Contact Column */}
                    <div className="text-center space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-sage mb-6">Contact</h3>
                        <a href="tel:+918590985286" className="block text-white/60 hover:text-white transition-colors">
                            <span className="flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" /> +91 85909 85286
                            </span>
                        </a>
                        <a href="mailto:domznaturelle@gmail.com" className="block text-white/60 hover:text-white transition-colors">
                            <span className="flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" /> domznaturelle@gmail.com
                            </span>
                        </a>
                    </div>

                    {/* Social Column */}
                    <div className="text-center md:text-right space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-sage mb-6">Follow Us</h3>
                        <div className="flex items-center justify-center md:justify-end gap-6">
                            <a href="https://instagram.com/domznaturelle/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-sage hover:scale-110 transition-all duration-300">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://facebook.com/DomzNaturelle/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-sage hover:scale-110 transition-all duration-300">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://wa.me/918590985286" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-sage hover:scale-110 transition-all duration-300">
                                <MessageCircle className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-white/20 uppercase tracking-widest gap-4">
                    <p>&copy; 2026 Domz Naturelle.</p>
                    <div className="flex items-center gap-2">
                        <span>Crafted with</span>
                        <Heart className="w-3 h-3 text-sage fill-sage animate-pulse" />
                        <span>by Domz</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
