import { useState, useRef } from 'react'
import { ArrowRight, Loader, Upload, FileText, X, ToggleLeft, ToggleRight } from 'lucide-react'

const EXAMPLES = [
    {
        label: "Hemoglobin Subunit Beta (Transport)",
        seq: "VHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFGKEFTPPVQAAYQKVVAGVANALAHKYH"
    },
    {
        label: "Insulin (Hormone)",
        seq: "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN"
    },
    {
        label: "Cytochrome c (Electron Transport)",
        seq: "MGDVEKGKKIFVQKCAQCHTVEKGGKHKTGPNLHGLFGRKTGQAPGFTYTDANKNKGITWKEETLMEYLENPKKYIPGTKMIFAGIKKKTEREDLIAYLKKATNE"
    },
    {
        label: "Lysozyme (Enzyme)",
        seq: "MKALIVLGLVLLSVTVQGKVFERCELARTLKRLGMDGYRGISLANWMCLAKWESGYNTRATNYNAGDRSTDYGIFQINSRYWCNDGKTPGAVNACHLSCSALLQDNIADAVACAKRVVRDPQGIRAWVAWRNRCQNRDVRQYVQGCGV"
    },
    {
        label: "Opsin (Signaling)",
        seq: "MNGTEGPNFYVPFSNKTGVVRSPFEAPQYYLAEPWQFSMLAAYMFLLIMLGFPINFLTLYVTVQHKKLRTPLNYILLNLAVADLFMVFGGFTTTLYTSLHGYFVFGPTGCNLEGFFATLGGEIALWSLVVLAIERYVVVCKPMSNFRFGENHAIMGVAFTWVMALACAAPPLVGWSRYIPEGMQCSCGIDYYTPHEETNNESFVIYMFVVHFIIPLIVIFFCYGQLVFTVKEAAAQQQESATTQKAEKEVTRMVIIMVIAFLICWLPYAGVAFYIFTHQGSDFGPIFMTIPAFFAKTSAVYNPVIYIMMNKQFRNCMVTTLCCGKNPLGDDEASTTVSKTETSQVAPA"
    }
]

/**
 * Parse a FASTA-formatted string into an array of { name, sequence } objects.
 */
function parseFASTA(text) {
    const sequences = []
    const blocks = text.split('>').filter(Boolean)

    for (const block of blocks) {
        const lines = block.trim().split('\n')
        const name = lines[0].trim().split(/\s+/)[0] || 'Unknown'
        const seq = lines.slice(1).join('').replace(/\s/g, '').toUpperCase()
        if (seq.length > 0) {
            sequences.push({ name, sequence: seq })
        }
    }

    // If no FASTA headers found, treat as raw sequence
    if (sequences.length === 0 && text.trim().length > 0) {
        const rawSeq = text.replace(/\s/g, '').toUpperCase()
        if (rawSeq.length > 0) {
            sequences.push({ name: 'Sequence_1', sequence: rawSeq })
        }
    }

    return sequences
}

const InputSection = ({ onAnalyze, onBatchAnalyze, loading }) => {
    const [sequence, setSequence] = useState('')
    const [exampleIndex, setExampleIndex] = useState(0)
    const [mode, setMode] = useState('single') // 'single' | 'batch'
    const [batchFile, setBatchFile] = useState(null)
    const [parsedBatch, setParsedBatch] = useState([])
    const [dragActive, setDragActive] = useState(false)
    const fileRef = useRef(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (mode === 'batch' && parsedBatch.length > 0) {
            onBatchAnalyze(parsedBatch)
        } else if (sequence.trim()) {
            onAnalyze(sequence)
        }
    }

    const handleSample = () => {
        const example = EXAMPLES[exampleIndex]
        setSequence(example.seq)
        setExampleIndex((prev) => (prev + 1) % EXAMPLES.length)
    }

    const handleFileSelect = (file) => {
        if (!file) return
        setBatchFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target.result
            const seqs = parseFASTA(text)
            setParsedBatch(seqs)
        }
        reader.readAsText(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        const file = e.dataTransfer?.files?.[0]
        if (file) handleFileSelect(file)
    }

    const clearFile = () => {
        setBatchFile(null)
        setParsedBatch([])
        if (fileRef.current) fileRef.current.value = ''
    }

    const isBatchReady = mode === 'batch' && parsedBatch.length > 0
    const isSingleReady = mode === 'single' && sequence.trim().length > 0

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-sans font-semibold tracking-wider text-charcoal/50 uppercase">
                    <label>Protein Sequence</label>
                    <span className="text-[10px] bg-sand text-charcoal/60 px-2 py-0.5 rounded-full">FASTA</span>
                </div>

                <button
                    type="button"
                    onClick={() => setMode(mode === 'single' ? 'batch' : 'single')}
                    className="flex items-center gap-1.5 text-xs font-sans font-medium px-3 py-1.5 rounded-full border transition-all cursor-pointer
                        border-sand text-charcoal/50 hover:text-terracotta hover:border-terracotta/30"
                >
                    {mode === 'single' ? <ToggleLeft size={14} /> : <ToggleRight size={14} className="text-terracotta" />}
                    {mode === 'single' ? 'Single' : 'Batch'}
                </button>
            </div>

            {/* === SINGLE MODE === */}
            {mode === 'single' && (
                <>
                    <div className="relative">
                        <textarea
                            value={sequence}
                            onChange={(e) => setSequence(e.target.value)}
                            placeholder={">Seq1\nMKT..."}
                            className="input-sequence w-full h-48"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-charcoal/30 font-mono pointer-events-none">
                            {sequence.length} chars
                        </div>
                    </div>

                    {/* Example loader row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handleSample}
                            className="text-terracotta hover:text-terracotta/80 transition-colors cursor-pointer flex items-center gap-1 group bg-terracotta/10 px-3 py-1.5 rounded-full border border-terracotta/20 hover:bg-terracotta/20 text-xs font-sans font-semibold"
                        >
                            {sequence ? "Next Example" : "Load Example"}
                            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </button>
                        {sequence && EXAMPLES.some(e => e.seq === sequence) && (
                            <span className="text-[10px] text-sage bg-sage/10 px-2 py-1 rounded-full border border-sage/20">
                                ✓ {EXAMPLES.find(e => e.seq === sequence)?.label.split('(')[0]}
                            </span>
                        )}
                    </div>

                    {/* Submit button — full width */}
                    <button
                        type="submit"
                        disabled={loading || !isSingleReady}
                        className="btn-organic w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin" size={18} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Run Analysis
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </>
            )}

            {/* === BATCH MODE === */}
            {mode === 'batch' && (
                <>
                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                            ${dragActive
                                ? 'border-terracotta bg-terracotta/5'
                                : batchFile
                                    ? 'border-sage/40 bg-sage/5'
                                    : 'border-sand hover:border-terracotta/40 hover:bg-terracotta/5'
                            }`}
                    >
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".fasta,.fa,.txt,.faa"
                            onChange={(e) => handleFileSelect(e.target.files?.[0])}
                            className="hidden"
                        />

                        {batchFile ? (
                            <div className="flex flex-col items-center gap-2">
                                <FileText size={28} className="text-sage" />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-sans font-medium text-charcoal">{batchFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); clearFile() }}
                                        className="p-1 rounded-full hover:bg-red-50 text-charcoal/30 hover:text-red-400 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <span className="text-xs font-sans text-sage font-medium">
                                    {parsedBatch.length} sequence{parsedBatch.length !== 1 ? 's' : ''} detected
                                    {parsedBatch.length > 20 && (
                                        <span className="text-terracotta"> (max 20 — first 20 will be used)</span>
                                    )}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload size={28} className="text-charcoal/30" />
                                <p className="text-sm font-sans text-charcoal/50">
                                    <span className="text-terracotta font-medium">Click to upload</span> or drag & drop
                                </p>
                                <p className="text-[10px] font-sans text-charcoal/30">.fasta, .fa, .txt — max 20 sequences</p>
                            </div>
                        )}
                    </div>

                    {/* Batch sequence preview */}
                    {parsedBatch.length > 0 && (
                        <div className="max-h-32 overflow-y-auto text-xs font-mono bg-white border border-sand rounded-xl p-3 space-y-1">
                            {parsedBatch.slice(0, 20).map((seq, i) => (
                                <div key={i} className="flex gap-2 text-charcoal/60">
                                    <span className="text-charcoal/30 w-5 text-right shrink-0">{i + 1}</span>
                                    <span className="font-sans font-medium text-charcoal/80 truncate max-w-[120px]">{seq.name}</span>
                                    <span className="text-charcoal/30 truncate">{seq.sequence.slice(0, 40)}...</span>
                                    <span className="text-charcoal/25 ml-auto shrink-0">{seq.sequence.length}aa</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !isBatchReady}
                            className="btn-organic disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    Analyzing {parsedBatch.length} sequences...
                                </>
                            ) : (
                                <>
                                    Analyze Batch
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </form>
    )
}

export default InputSection
