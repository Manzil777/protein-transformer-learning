import { useMemo } from 'react'

const AMINO_ACID_PROPERTIES = {
    // Hydrophobic
    A: { type: 'hydrophobic', color: 'bg-amber-600', name: 'Alanine' },
    V: { type: 'hydrophobic', color: 'bg-amber-700', name: 'Valine' },
    L: { type: 'hydrophobic', color: 'bg-amber-700', name: 'Leucine' },
    I: { type: 'hydrophobic', color: 'bg-amber-800', name: 'Isoleucine' },
    M: { type: 'hydrophobic', color: 'bg-amber-600', name: 'Methionine' },
    F: { type: 'hydrophobic', color: 'bg-amber-800', name: 'Phenylalanine' },
    W: { type: 'hydrophobic', color: 'bg-amber-900', name: 'Tryptophan' },
    P: { type: 'hydrophobic', color: 'bg-amber-500', name: 'Proline' },

    // Polar
    G: { type: 'polar', color: 'bg-emerald-400', name: 'Glycine' },
    S: { type: 'polar', color: 'bg-emerald-500', name: 'Serine' },
    T: { type: 'polar', color: 'bg-emerald-600', name: 'Threonine' },
    C: { type: 'polar', color: 'bg-emerald-500', name: 'Cysteine' },
    Y: { type: 'polar', color: 'bg-emerald-700', name: 'Tyrosine' },
    N: { type: 'polar', color: 'bg-emerald-400', name: 'Asparagine' },
    Q: { type: 'polar', color: 'bg-emerald-400', name: 'Glutamine' },

    // Charged
    D: { type: 'negative', color: 'bg-rose-500', name: 'Aspartate' },
    E: { type: 'negative', color: 'bg-rose-600', name: 'Glutamate' },
    K: { type: 'positive', color: 'bg-violet-500', name: 'Lysine' },
    R: { type: 'positive', color: 'bg-violet-600', name: 'Arginine' },
    H: { type: 'positive', color: 'bg-violet-400', name: 'Histidine' },
}

const SequenceHeatmap = ({ sequence }) => {

    const analysis = useMemo(() => {
        if (!sequence) return { hydrophobic: 0, polar: 0, charged: 0 }
        let counts = { hydrophobic: 0, polar: 0, charged: 0 }
        for (let char of sequence) {
            const prop = AMINO_ACID_PROPERTIES[char]
            if (prop) {
                if (prop.type === 'hydrophobic') counts.hydrophobic++
                else if (prop.type === 'polar') counts.polar++
                else counts.charged++
            }
        }
        return counts
    }, [sequence])

    const total = sequence.length || 1
    const mw = useMemo(() => {
        // Approximate molecular weight (avg 110 Da per residue)
        return (sequence.length * 110 / 1000).toFixed(1)
    }, [sequence])

    return (
        <div className="space-y-5 font-sans">
            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-semibold text-charcoal/50 uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-600" /> Hydrophobic</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Polar</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Charged</div>
            </div>

            {/* Sequence Bar */}
            <div className="h-7 w-full flex rounded-xl overflow-hidden border border-sand">
                {sequence.split('').map((char, index) => {
                    const prop = AMINO_ACID_PROPERTIES[char] || { color: 'bg-sand' }
                    return (
                        <div
                            key={index}
                            className={`${prop.color} hover:brightness-110 transition-all`}
                            style={{ width: `${100 / sequence.length}%` }}
                            title={`${char} (${prop.type || 'unknown'})`}
                        />
                    )
                })}
            </div>

            {/* Composition Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-cream p-3 rounded-2xl border border-sand text-center">
                    <div className="text-lg font-bold text-amber-600 leading-tight">{Math.round((analysis.hydrophobic / total) * 100)}%</div>
                    <div className="text-[9px] text-charcoal/40 uppercase font-semibold tracking-wide mt-0.5">Hydro.</div>
                </div>
                <div className="bg-cream p-3 rounded-2xl border border-sand text-center">
                    <div className="text-lg font-bold text-emerald-600 leading-tight">{Math.round((analysis.polar / total) * 100)}%</div>
                    <div className="text-[9px] text-charcoal/40 uppercase font-semibold tracking-wide mt-0.5">Polar</div>
                </div>
                <div className="bg-cream p-3 rounded-2xl border border-sand text-center">
                    <div className="text-lg font-bold text-violet-500 leading-tight">{Math.round((analysis.charged / total) * 100)}%</div>
                    <div className="text-[9px] text-charcoal/40 uppercase font-semibold tracking-wide mt-0.5">Charged</div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-cream/60 px-3 py-2 rounded-xl border border-sand/80 flex items-center justify-between">
                    <span className="text-[10px] text-charcoal/40 uppercase font-semibold">Length</span>
                    <span className="text-sm font-mono font-bold text-charcoal">{sequence.length} <span className="text-[9px] font-normal text-charcoal/40">aa</span></span>
                </div>
                <div className="bg-cream/60 px-3 py-2 rounded-xl border border-sand/80 flex items-center justify-between">
                    <span className="text-[10px] text-charcoal/40 uppercase font-semibold">Est. MW</span>
                    <span className="text-sm font-mono font-bold text-charcoal">{mw} <span className="text-[9px] font-normal text-charcoal/40">kDa</span></span>
                </div>
            </div>
        </div>
    )
}

export default SequenceHeatmap
