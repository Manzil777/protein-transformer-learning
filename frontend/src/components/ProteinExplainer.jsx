
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, RefreshCw, AlertCircle, AlertTriangle, Info, CheckCircle, Activity, ChevronDown, ChevronUp } from 'lucide-react'
import axios from 'axios'

const ProteinExplainer = ({ family, confidence, sequence }) => {
    const [explanation, setExplanation] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchExplanation = async () => {
        if (!family) return

        setLoading(true)
        setError(null)

        try {
            const response = await axios.post('/api/explain', {
                family,
                confidence,
                sequence
            })
            setExplanation(response.data.explanation)
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to generate explanation'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchExplanation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [family])

    // Parse the explanation into sections by emoji headings
    const parseSections = (text) => {
        if (!text) return []

        const sectionEmojis = ['🧬', '🏥', '🔬', '💡']
        const sections = []
        let currentSection = null

        const lines = text.split('\n')
        for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            const matchedEmoji = sectionEmojis.find(e => trimmed.startsWith(e))
            if (matchedEmoji) {
                if (currentSection) sections.push(currentSection)
                currentSection = {
                    emoji: matchedEmoji,
                    title: trimmed.replace(matchedEmoji, '').trim(),
                    content: ''
                }
            } else if (currentSection) {
                currentSection.content += (currentSection.content ? ' ' : '') + trimmed
            }
        }
        if (currentSection) sections.push(currentSection)

        return sections
    }

    const sectionColors = {
        '🧬': { bg: 'bg-terracotta/5', border: 'border-terracotta/20', text: 'text-terracotta' },
        '🏥': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
        '🔬': { bg: 'bg-sage/10', border: 'border-sage/30', text: 'text-sage' },
        '💡': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl p-6 border border-sand shadow-sm"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-5 border-b border-sand pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-terracotta to-terracotta/60 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-serif font-bold text-charcoal">AI Insights</h3>
                        <p className="text-[10px] text-charcoal/40 font-sans">Biological context for your classification</p>
                    </div>
                </div>
                <button
                    onClick={fetchExplanation}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-sans font-medium text-charcoal/50 hover:text-terracotta transition-colors disabled:opacity-40 cursor-pointer bg-cream hover:bg-sand/50 px-3 py-1.5 rounded-xl border border-sand"
                    title="Generate new explanation"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Generating...' : 'Regenerate'}
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-sand/60 rounded-lg" />
                                    <div className="h-3 bg-sand/60 rounded-full w-32" />
                                </div>
                                <div className="space-y-1.5 pl-8">
                                    <div className="h-2.5 bg-sand/40 rounded-full w-full" />
                                    <div className="h-2.5 bg-sand/40 rounded-full w-4/5" />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100"
                    >
                        <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-sans font-medium text-red-600">Could not generate AI insights</p>
                            <p className="text-xs text-red-400 mt-1">{error}</p>
                        </div>
                    </motion.div>
                ) : explanation ? (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                        {parseSections(explanation).map((section, i) => {
                            const colors = sectionColors[section.emoji] || sectionColors['🧬']
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`p - 4 rounded - 2xl border ${colors.bg} ${colors.border} `}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{section.emoji}</span>
                                        <h4 className={`text - xs font - sans font - bold uppercase tracking - wider ${colors.text} `}>
                                            {section.title}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-charcoal/70 font-sans leading-relaxed">
                                        {section.content}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    )
}

export default ProteinExplainer
