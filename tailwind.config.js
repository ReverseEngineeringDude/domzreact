/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                sage: '#8A9A5B',
                bone: '#F9F6F0',
                charcoal: '#36454F',
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'], // Fallback or secondary
            },
        },
    },
    plugins: [],
}
