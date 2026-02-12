/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cream: '#F5F1EC',
                charcoal: '#3D3D3D',
                sage: '#9BA89F',
                terracotta: '#C17A4D',
                sand: '#E8E0D5',
            },
            fontFamily: {
                serif: ['Gambetta', 'Georgia', 'serif'],
                sans: ['Satoshi', 'system-ui', 'sans-serif'],
                mono: ['"Fira Code"', 'monospace'],
            },
            borderRadius: {
                'organic': '50px 50px 50px 12px',
                'organic-hover': '50px 12px 50px 50px',
                'blob': '60% 40% 30% 70% / 60% 30% 70% 40%',
            },
            animation: {
                'morph': 'morph 8s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'reveal-up': 'revealUp 0.6s ease-out forwards',
                'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
            },
            keyframes: {
                morph: {
                    '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
                    '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-10px) rotate(2deg)' },
                },
                revealUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 40px rgba(193, 122, 77, 0.15)' },
                    '50%': { boxShadow: '0 0 80px rgba(193, 122, 77, 0.3)' },
                },
            },
        },
    },
    plugins: [],
}
