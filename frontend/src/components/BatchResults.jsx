import { useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ChevronDown, ChevronUp, Download } from 'lucide-react'

const BatchResults = ({ results, onExportCSV }) => {
    const [expandedRow, setExpandedRow] = useState(null)

    if (!results || results.length === 0) return null

    const sorted = [...results].sort((a, b) => (b.confidence || 0) - (a.confidence || 0))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-sand shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-sand">
                <div>
                    <h3 className="text-sm font-serif font-bold text-charcoal">
                        Batch Results
                    </h3>
                    <p className="text-[10px] text-charcoal/40 font-sans mt-0.5">
                        {results.length} sequences classified
                    </p>
                </div>
                {onExportCSV && (
                    <button
                        onClick={() => onExportCSV(results)}
                        className="flex items-center gap-1.5 text-xs font-sans font-medium text-charcoal/50 hover:text-terracotta transition-colors cursor-pointer bg-cream hover:bg-sand/50 px-3 py-1.5 rounded-xl border border-sand"
                    >
                        <Download size={12} />
                        Export CSV
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-sans font-bold uppercase tracking-wider text-charcoal/40 border-b border-sand/50">
                            <th className="px-6 py-3">#</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Family</th>
                            <th className="px-4 py-3">Confidence</th>
                            <th className="px-4 py-3 hidden sm:table-cell">Length</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((result, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className={`border-b border-sand/30 hover:bg-cream/50 transition-colors cursor-pointer ${expandedRow === i ? 'bg-cream/50' : ''}`}
                                onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                            >
                                <td className="px-6 py-3 text-xs font-mono text-charcoal/30">{i + 1}</td>
                                <td className="px-4 py-3 text-sm font-sans font-medium text-charcoal max-w-[180px] truncate">
                                    {result.name}
                                </td>
                                <td className="px-4 py-3">
                                    {result.error ? (
                                        <span className="text-xs font-sans text-red-400 flex items-center gap-1">
                                            <AlertTriangle size={12} /> {result.error}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-sans font-medium text-charcoal">
                                            {result.family}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {result.confidence != null && !result.error ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-sand/50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${result.confidence > 0.8 ? 'bg-sage' : 'bg-terracotta'}`}
                                                    style={{ width: `${Math.round(result.confidence * 100)}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-mono ${result.confidence > 0.8 ? 'text-sage' : 'text-terracotta'}`}>
                                                {Math.round(result.confidence * 100)}%
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-charcoal/30">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell text-xs font-mono text-charcoal/40">
                                    {result.sequence ? result.sequence.length : '—'}
                                </td>
                                <td className="px-4 py-3 text-charcoal/30">
                                    {expandedRow === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expanded detail */}
            <AnimatePresence>
                {expandedRow !== null && sorted[expandedRow] && !sorted[expandedRow].error && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-sand bg-cream/30 px-6 py-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                            <div>
                                <span className="text-charcoal/40 uppercase tracking-wider text-[10px] font-bold">Family</span>
                                <p className="text-charcoal font-medium mt-1">{sorted[expandedRow].family}</p>
                            </div>
                            <div>
                                <span className="text-charcoal/40 uppercase tracking-wider text-[10px] font-bold">Confidence</span>
                                <p className={`font-mono font-bold mt-1 ${sorted[expandedRow].confidence > 0.8 ? 'text-sage' : 'text-terracotta'}`}>
                                    {Math.round(sorted[expandedRow].confidence * 100)}%
                                </p>
                            </div>
                            <div>
                                <span className="text-charcoal/40 uppercase tracking-wider text-[10px] font-bold">PCA Coordinates</span>
                                <p className="text-charcoal/60 font-mono mt-1">
                                    ({sorted[expandedRow].pca_x?.toFixed(2)}, {sorted[expandedRow].pca_y?.toFixed(2)})
                                </p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-charcoal/40 uppercase tracking-wider text-[10px] font-bold font-sans">Sequence</span>
                            <p className="text-[11px] font-mono text-charcoal/50 mt-1 break-all leading-relaxed">
                                {sorted[expandedRow].sequence}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default BatchResults
