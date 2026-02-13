import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Info, Box, Activity, Download, Printer } from 'lucide-react'
import { exportCSV, exportPDF } from '../utils/exportUtils'
import EmbeddingChart from './EmbeddingChart'
import StructureViewer from './StructureViewer'
import SequenceHeatmap from './SequenceHeatmap'
import ProteinExplainer from './ProteinExplainer'

const ResultsDashboard = ({ data, trainingPoints, loading, pdbData, folding }) => {
    const { family, confidence, pca_x, pca_y } = data
    const confPercent = Math.round(confidence * 100)
    const sequence = data.sequence || "MKTVRQERLKSIVRILERSKEPVSGAQLAEELSVSRQVIVQDIAYLRSLGYNIVATPRGYVLAGG"

    return (
        <div className={`space-y-6 transition-opacity duration-300 print-area ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-3xl p-6 border border-sand shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-terracotta rounded-l-3xl" />
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-charcoal/40 font-sans font-semibold uppercase tracking-widest flex items-center gap-1">
                            Predicted Family
                            <Info size={12} className="text-charcoal/30 cursor-help hover:text-terracotta transition-colors" title="The protein family this sequence likely belongs to." />
                        </div>
                        {/* Export buttons — tucked into the family card */}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => exportCSV(data, 'protein_analysis.csv')}
                                className="flex items-center gap-1 text-[10px] font-sans font-medium text-charcoal/35 hover:text-terracotta transition-colors cursor-pointer bg-cream/60 hover:bg-sand/40 px-2 py-1 rounded-lg border border-sand/60"
                            >
                                <Download size={10} />
                                CSV
                            </button>
                            <button
                                onClick={exportPDF}
                                className="flex items-center gap-1 text-[10px] font-sans font-medium text-charcoal/35 hover:text-terracotta transition-colors cursor-pointer bg-cream/60 hover:bg-sand/40 px-2 py-1 rounded-lg border border-sand/60"
                            >
                                <Printer size={10} />
                                PDF
                            </button>
                        </div>
                    </div>
                    <div className="text-xl md:text-2xl font-serif font-bold text-charcoal truncate">
                        {family}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl p-6 border border-sand shadow-sm relative overflow-hidden"
                >
                    <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-3xl ${confPercent > 80 ? 'bg-sage' : 'bg-terracotta'}`} />
                    <div className="text-xs text-charcoal/40 font-sans font-semibold uppercase tracking-widest mb-1">Confidence Score</div>
                    <div className="flex items-end gap-2">
                        <span className={`text-3xl font-mono font-bold ${confPercent > 80 ? 'text-sage' : 'text-terracotta'}`}>
                            {confPercent}%
                        </span>
                        {confPercent > 80 ? (
                            <CheckCircle size={20} className="text-sage mb-2 opacity-80" />
                        ) : (
                            <AlertTriangle size={20} className="text-terracotta mb-2 opacity-80" />
                        )}
                    </div>
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1.5 bg-sand/50 w-full">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${confPercent}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full ${confPercent > 80 ? 'bg-sage' : 'bg-terracotta'}`}
                        />
                    </div>
                </motion.div>
            </div>

            {/* AI Insights */}
            <ProteinExplainer family={family} confidence={confidence} sequence={sequence} />

            {/* Embedding Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-6 border border-sand shadow-sm min-h-[350px]"
            >
                <div className="flex justify-between items-center mb-4 border-b border-sand pb-4">
                    <div>
                        <h3 className="text-sm font-serif font-bold text-charcoal flex items-center gap-2">
                            Embedding Space Visualization
                        </h3>
                        <p className="text-xs text-charcoal/40 font-sans mt-1">2D PCA Projection of 320-dim Transformer Embeddings</p>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <EmbeddingChart
                        trainingData={trainingPoints}
                        currentPoint={{ x: pca_x, y: pca_y, label: 'Input Sequence' }}
                    />
                </div>
            </motion.div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3D Structure */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl p-4 sm:p-6 border border-sand shadow-sm h-[350px] sm:h-[450px] flex flex-col"
                >
                    <div className="mb-3 flex items-center gap-2 border-b border-sand pb-3">
                        <Box size={16} className="text-terracotta" />
                        <h3 className="text-sm font-serif font-bold text-charcoal">3D Structure (Interactive)</h3>
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden border border-sand">
                        <StructureViewer family={family} pdbData={pdbData} folding={folding} />
                    </div>
                </motion.div>

                {/* Sequence Properties */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl p-4 sm:p-6 border border-sand shadow-sm h-[350px] sm:h-[450px] flex flex-col"
                >
                    <div className="mb-3 flex items-center gap-2 border-b border-sand pb-3">
                        <Activity size={16} className="text-sage" />
                        <h3 className="text-sm font-serif font-bold text-charcoal">Sequence Properties</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <SequenceHeatmap sequence={sequence} />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default ResultsDashboard
