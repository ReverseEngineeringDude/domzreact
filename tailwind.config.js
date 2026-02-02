/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                sage: '#7C904E', // Slightly deeper/muted sage
                'sage-light': '#B2C290',
                bone: '#F9F6F0',
                charcoal: '#2C3A2E', // Deep Green-Black for high contrast
                sand: '#E8E4D9',
                stone: {
                    50: '#F5F5F4',
                    100: '#E7E5E4',
                    200: '#D6D3D1',
                    300: '#A8A29E', // Standard Tailwind Stone
                }
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'], // Fallback or secondary
            },
        },
    },
    plugins: [],
}
