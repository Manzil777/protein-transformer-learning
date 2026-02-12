
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Sparkles } from 'lucide-react'
import InputSection from '../components/InputSection'
import BatchResults from '../components/BatchResults'
import SkeletonDashboard from '../components/SkeletonDashboard'
import { exportCSV } from '../utils/exportUtils'

export default function Analyzer() {
    const [prediction, setPrediction] = useState(null)
    const [loading, setLoading] = useState(false)
    const [folding, setFolding] = useState(false)
    const [pdbData, setPdbData] = useState(null)
    const [error, setError] = useState(null)
    const [trainingData, setTrainingData] = useState([])
    const [batchResults, setBatchResults] = useState(null)
    const [batchLoading, setBatchLoading] = useState(false)

    useEffect(() => {
        axios.get('/api/data')
            .then(res => setTrainingData(res.data))
            .catch(err => console.error("Failed to load training data", err))
    }, [])

    // === Single analysis ===
    const handleAnalyze = async (sequence) => {
        setLoading(true)
        setError(null)
        setPdbData(null)
        setBatchResults(null) // Clear batch when doing single

        try {
            const response = await axios.post('/api/predict', { sequence })
            setPrediction(response.data)

            setFolding(true)
            try {
                const foldRes = await axios.post('/api/fold', { sequence })
                setPdbData(foldRes.data.pdb)
            } catch (foldErr) {
                console.warn("ESMFold failed, using fallback:", foldErr.message)
            } finally {
                setFolding(false)
            }
        } catch (err) {
            setError(err.response?.data?.error || "Analysis failed")
        } finally {
            setLoading(false)
        }
    }

    // === Batch analysis ===
    const handleBatchAnalyze = async (sequences) => {
        setBatchLoading(true)
        setError(null)
        setPrediction(null)   // Clear single when doing batch
        setBatchResults(null)

        try {
            const response = await axios.post('/api/predict-batch', {
                sequences: sequences.slice(0, 20)
            })
            setBatchResults(response.data.results)
        } catch (err) {
            setError(err.response?.data?.error || "Batch analysis failed")
        } finally {
            setBatchLoading(false)
        }
    }

    const isLoading = loading || batchLoading

    return (
        <div className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 gap-4">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-sans text-charcoal/50 hover:text-terracotta transition-colors mb-4">
                            <ArrowLeft size={16} /> Back to Home
                        </Link>
                        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal">
                            Protein <em className="text-terracotta font-normal">Analyzer</em>
                        </h1>
                        <p className="text-charcoal/50 font-sans mt-2 text-sm sm:text-base">
                            Classify sequences, predict 3D structures, and explore embeddings.
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-sand text-sm font-sans">
                            <div className="pulse-dot" />
                            <span className="text-charcoal/60">ESM-2 Active</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-sand text-sm font-sans">
                            <Sparkles size={14} className="text-terracotta" />
                            <span className="text-charcoal/60">ESMFold Ready</span>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Input Column */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-sand shadow-sm">
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal mb-2 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-terracotta text-cream text-sm font-sans font-bold">1</span>
                                Input Sequence
                            </h3>
                            <p className="text-sm text-charcoal/50 font-sans mb-4 sm:mb-6">Paste a sequence, load an example, or upload a FASTA file.</p>
                            <InputSection
                                onAnalyze={handleAnalyze}
                                onBatchAnalyze={handleBatchAnalyze}
                                loading={isLoading}
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-red-700 text-sm font-sans"
                            >
                                <strong>Error:</strong> {error}
                            </motion.div>
                        )}

                        {/* Guide Card */}
                        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-sand shadow-sm">
                            <h3 className="font-serif text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                                <Sparkles size={18} className="text-terracotta" />
                                How It Works
                            </h3>
                            <div className="space-y-4 font-sans text-sm text-charcoal/60">
                                <div className="p-4 bg-cream rounded-2xl">
                                    <h4 className="font-bold text-terracotta mb-1">1. Classification</h4>
                                    <p className="text-xs leading-relaxed">
                                        Your sequence is turned into an <strong>ESM-2 embedding</strong> and classified into one of 321 protein families.
                                    </p>
                                </div>
                                <div className="p-4 bg-cream rounded-2xl">
                                    <h4 className="font-bold text-sage mb-1">2. Structure Prediction</h4>
                                    <p className="text-xs leading-relaxed">
                                        Simultaneously, <strong>ESMFold</strong> predicts the actual 3D shape of your protein — just like AlphaFold!
                                    </p>
                                </div>
                                <div className="p-4 bg-cream rounded-2xl">
                                    <h4 className="font-bold text-charcoal/70 mb-1">3. Visualization</h4>
                                    <p className="text-xs leading-relaxed">
                                        Explore the predicted structure in 3D, see where your protein sits in embedding space, and analyze its properties.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-7">
                        <div className="min-h-[400px] sm:min-h-[500px] relative">
                            <AnimatePresence mode="wait">
                                {/* Skeleton loading state */}
                                {(loading && !prediction) && (
                                    <motion.div
                                        key="skeleton"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <SkeletonDashboard />
                                    </motion.div>
                                )}

                                {/* Batch loading skeleton */}
                                {batchLoading && (
                                    <motion.div
                                        key="batch-skeleton"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-white rounded-3xl border border-sand shadow-sm overflow-hidden">
                                            <div className="px-6 py-4 border-b border-sand">
                                                <div className="h-4 w-24 animate-pulse bg-sand/40 rounded-xl" />
                                            </div>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="flex gap-4 px-6 py-3 border-b border-sand/30">
                                                    <div className="h-3 w-6 animate-pulse bg-sand/40 rounded" />
                                                    <div className="h-3 w-28 animate-pulse bg-sand/40 rounded" />
                                                    <div className="h-3 w-32 animate-pulse bg-sand/40 rounded" />
                                                    <div className="h-3 w-16 animate-pulse bg-sand/40 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Batch results */}
                                {batchResults && !batchLoading && (
                                    <motion.div
                                        key="batch-results"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <BatchResults
                                            results={batchResults}
                                            onExportCSV={(results) => exportCSV(results, 'batch_results.csv')}
                                        />
                                    </motion.div>
                                )}

                                {/* Single-sequence results */}
                                {prediction && !loading && !batchResults && (
                                    <ResultsDashboard
                                        key="results"
                                        data={prediction}
                                        trainingPoints={trainingData}
                                        loading={loading}
                                        pdbData={pdbData}
                                        folding={folding}
                                    />
                                )}

                                {/* Re-analyzing overlay for single mode */}
                                {loading && prediction && (
                                    <div className="absolute inset-0 z-10 bg-cream/60 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                                        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-lg border border-sand">
                                            <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
                                            <span className="text-charcoal font-sans font-medium">Analyzing sequence...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Empty state */}
                                {!prediction && !loading && !batchResults && !batchLoading && (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full flex flex-col items-center justify-center bg-white border-2 border-dashed border-sand rounded-3xl p-8 sm:p-16 text-center min-h-[400px] sm:min-h-[500px]"
                                    >
                                        <div className="w-16 sm:w-20 h-16 sm:h-20 bg-terracotta/10 rounded-full flex items-center justify-center mb-6">
                                            <Microscope className="w-8 sm:w-10 h-8 sm:h-10 text-terracotta" />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-charcoal mb-3">Ready to Analyze</h3>
                                        <p className="text-charcoal/50 font-sans max-w-sm text-sm">
                                            Enter a protein sequence or upload a FASTA file to discover classifications, predict 3D structures, and explore interactive visualizations.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
