import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, Dna, Sparkles, Layers, BarChart3, Box, Microscope } from 'lucide-react'

// ===== SCROLL REVEAL HOOK =====
function useReveal() {
    const ref = useRef(null)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible')
                }
            },
            { threshold: 0.1 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])
    return ref
}

function RevealSection({ children, className = '', delay = 0 }) {
    const ref = useReveal()
    return (
        <div
            ref={ref}
            className={`reveal-up ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}

export default function Home() {
    return (
        <>
            {/* ===== HERO SECTION ===== */}
            <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12 section-gap">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Left: Content */}
                    <div>
                        <RevealSection>
                            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-terracotta/30 rounded-full text-sm font-sans font-medium text-terracotta mb-8">
                                <div className="pulse-dot" />
                                AI-Powered Classification
                            </div>
                        </RevealSection>

                        <RevealSection delay={100}>
                            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-[84px] leading-[1.05] font-bold mb-6 sm:mb-8 text-charcoal">
                                Decode the
                                <br />
                                <em className="text-terracotta font-normal">language</em> of
                                <br />
                                proteins.
                            </h1>
                        </RevealSection>

                        <RevealSection delay={200}>
                            <p className="text-base sm:text-lg md:text-xl text-charcoal/60 font-sans leading-relaxed max-w-lg mb-8 sm:mb-10">
                                Harness the power of ESM-2 transformers to classify protein sequences,
                                predict molecular structures, and explore the hidden patterns of life.
                            </p>
                        </RevealSection>

                        <RevealSection delay={300}>
                            <div className="flex flex-wrap items-center gap-4 mb-12">
                                <Link to="/analyze" className="btn-organic text-lg">
                                    Start Analyzing <ArrowRight size={20} />
                                </Link>
                                <a href="#process" className="btn-organic-outline">
                                    Learn How
                                </a>
                            </div>
                        </RevealSection>

                        <RevealSection delay={400}>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {['🧬', '🔬', '🧪', '💊'].map((emoji, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-sand border-2 border-cream flex items-center justify-center text-lg">
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm font-sans">
                                    <span className="font-bold text-charcoal">321+</span>
                                    <span className="text-charcoal/50"> protein families classified</span>
                                </div>
                            </div>
                        </RevealSection>
                    </div>

                    {/* Right: Morphing Blob */}
                    <div className="relative flex items-center justify-center hidden lg:flex">
                        <div className="absolute -top-10 -right-10 w-80 h-80 bg-sage/20 blob" />
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-terracotta/15 blob" style={{ animationDelay: '-3s' }} />

                        <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] blob overflow-hidden bg-gradient-to-br from-sage/40 to-terracotta/30 flex items-center justify-center">
                            <div className="text-center p-8">
                                <Dna className="w-20 h-20 text-charcoal/40 mx-auto mb-4" />
                                <p className="font-serif text-2xl text-charcoal/60 italic">ESM-2</p>
                                <p className="text-sm text-charcoal/40 font-sans mt-2">Transformer Model</p>
                            </div>
                        </div>

                        <div className="floating-badge absolute bottom-6 right-6 md:bottom-10 md:right-0 bg-white rounded-2xl shadow-lg px-5 py-3 border border-sand flex items-center gap-3 w-[200px]">
                            <div className="pulse-dot" />
                            <div>
                                <p className="text-xs font-sans font-bold text-charcoal">Model Active</p>
                                <p className="text-[10px] text-charcoal/50">ESM-2 · CPU Inference</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SERVICES BENTO ===== */}
            <section id="services" className="px-4 sm:px-6 md:px-12 section-gap">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4">
                        <RevealSection>
                            <p className="text-sm font-sans font-bold text-sage uppercase tracking-widest mb-4">Capabilities</p>
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal leading-tight mb-6">
                                What this platform <em className="text-terracotta font-normal">offers</em>
                            </h2>
                            <p className="text-charcoal/50 font-sans leading-relaxed">
                                A comprehensive suite of bioinformatics tools powered by state-of-the-art transformer models.
                            </p>
                        </RevealSection>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { icon: <Dna size={24} />, color: 'terracotta', title: 'Sequence Classification', desc: 'Classify protein sequences into 321+ families using real ESM-2 embeddings.' },
                            { icon: <Box size={24} />, color: 'sage', title: '3D Structure Prediction', desc: 'Predict the actual 3D structure of any protein using ESMFold — just like AlphaFold.' },
                            { icon: <BarChart3 size={24} />, color: 'terracotta', title: 'Embedding Space', desc: 'Visualize how your protein relates to training data in 2D PCA space.' },
                            { icon: <Layers size={24} />, color: 'sage', title: 'Sequence Properties', desc: 'Analyze amino acid composition, hydrophobicity, charge, and polarity.' },
                        ].map((service, i) => (
                            <RevealSection key={i} delay={i * 100}>
                                <div className="warm-card group cursor-default">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${service.color === 'terracotta' ? 'bg-terracotta/15 text-terracotta' : 'bg-sage/20 text-sage'}`}>
                                        {service.icon}
                                    </div>
                                    <h3 className="font-serif text-xl font-bold text-charcoal mb-2">{service.title}</h3>
                                    <p className="text-sm text-charcoal/50 font-sans leading-relaxed">{service.desc}</p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PROCESS SECTION ===== */}
            <section id="process" className="px-4 sm:px-6 md:px-12 section-gap">
                <div className="max-w-7xl mx-auto bg-charcoal rounded-[48px] overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        <div className="p-8 sm:p-12 md:p-16 flex items-center justify-center relative">
                            <div className="relative -rotate-2">
                                <div className="w-64 h-64 md:w-80 md:h-80 blob bg-gradient-to-br from-sage/40 to-terracotta/30 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="font-serif text-4xl text-cream/80 italic">ESM-2</p>
                                        <p className="text-cream/40 text-sm font-sans mt-2">8M Parameters</p>
                                    </div>
                                </div>
                            </div>
                            <div className="floating-badge absolute bottom-8 left-8 bg-cream/10 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center border border-cream/20">
                                <Sparkles className="text-terracotta" size={24} />
                            </div>
                        </div>

                        <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-center">
                            <RevealSection>
                                <p className="text-sm font-sans font-bold text-sage uppercase tracking-widest mb-4">Our Process</p>
                                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sand leading-tight mb-6">
                                    From <em className="text-terracotta font-normal">sequence</em> to insight
                                </h2>
                                <p className="text-sand/60 font-sans leading-relaxed mb-8">
                                    Your protein sequence passes through a transformer neural network that converts it into a mathematical fingerprint.
                                    This embedding captures the biochemical essence of the protein, enabling accurate classification and structure prediction.
                                </p>
                            </RevealSection>

                            <RevealSection delay={100}>
                                <div className="flex flex-wrap gap-3">
                                    {['Mindful', 'Strategic', 'AI-Powered', 'Real-Time', 'Interactive'].map((tag, i) => (
                                        <span key={i} className="px-4 py-2 bg-cream/10 text-sand/80 text-sm font-sans rounded-full border border-cream/10">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </RevealSection>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CONTACT CTA ===== */}
            <section id="contact" className="px-4 sm:px-6 md:px-12 section-gap text-center">
                <div className="max-w-4xl mx-auto">
                    <RevealSection>
                        <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-[96px] font-bold text-charcoal leading-[1.1] mb-8 sm:mb-10 animate-pulse-glow inline-block rounded-3xl px-4">
                            Ready to <em className="text-terracotta font-normal">explore?</em>
                        </h2>
                    </RevealSection>

                    <RevealSection delay={100}>
                        <p className="text-lg sm:text-xl text-charcoal/50 font-sans mb-8 sm:mb-10 max-w-xl mx-auto">
                            Start classifying protein sequences and predicting 3D structures with our AI-powered platform.
                        </p>
                    </RevealSection>

                    <RevealSection delay={200}>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link to="/analyze" className="btn-organic text-base sm:text-xl !py-3 sm:!py-4 !px-6 sm:!px-8">
                                <Microscope size={20} /> Analyze Now
                            </Link>
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-organic-outline text-base sm:text-xl !py-3 sm:!py-4 !px-6 sm:!px-8">
                                View Source
                            </a>
                        </div>
                    </RevealSection>
                </div>
            </section>
        </>
    )
}
