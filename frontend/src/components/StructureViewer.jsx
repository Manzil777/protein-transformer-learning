import { useEffect, useRef } from 'react'
import * as NGL from 'ngl'

// Map real classification names to representative PDB structures
const FAMILY_PDB_MAP = {
    'OXYGEN TRANSPORT': '1MBN',
    'OXYGEN STORAGE/TRANSPORT': '4HHB',
    'HYDROLASE': '1LYZ',
    'TRANSFERASE': '1CDK',
    'OXIDOREDUCTASE': '1CYC',
    'LYASE': '1QPG',
    'ISOMERASE': '1TIM',
    'LIGASE': '1GN1',
    'IMMUNE SYSTEM': '1IGT',
    'SIGNALING PROTEIN': '1UBQ',
    'HORMONE': '4INS',
    'VIRAL PROTEIN': '1HGE',
    'TOXIN': '1CRN',
    'ANTIBIOTIC': '1GFL',
    'TRANSCRIPTION': '1LMB',
    'CHAPERONE': '1AON',
    'TRANSPORT PROTEIN': '2OCC',
    'ALLERGEN': '1BV1',
    'STRUCTURAL PROTEIN': '1CRN',
    'CELL ADHESION': '1L3Y',
    'FLUORESCENT PROTEIN': '1GFL',
    'MEMBRANE PROTEIN': '1BL8',
    'PHOTOSYNTHESIS': '1JB0',
    'CONTRACTILE PROTEIN': '1ATN',
    'MOTOR PROTEIN': '2MYS',
    'BLOOD CLOTTING': '1THW',
    'ELECTRON TRANSPORT': '1CYC',
    'METAL BINDING PROTEIN': '1MFT',
    'SUGAR BINDING PROTEIN': '1LTE',
}

const KEYWORD_PDB_MAP = {
    'HYDROLASE': '1LYZ',
    'TRANSFERASE': '1CDK',
    'OXIDOREDUCTASE': '1CYC',
    'LYASE': '1QPG',
    'KINASE': '1CDK',
    'PROTEASE': '1PPE',
    'NUCLEASE': '1AKE',
    'SYNTHASE': '1QPG',
    'REDUCTASE': '1CYC',
    'DEHYDROGENASE': '1LDM',
    'TRANSPORT': '1MBN',
    'BINDING': '1UBQ',
    'RECEPTOR': '1HGE',
    'INHIBITOR': '1BPI',
}

function getPdbForFamily(family) {
    if (!family) return '4HHB'
    const upper = family.toUpperCase()
    if (FAMILY_PDB_MAP[upper]) return FAMILY_PDB_MAP[upper]
    for (const [keyword, pdb] of Object.entries(KEYWORD_PDB_MAP)) {
        if (upper.includes(keyword)) return pdb
    }
    return '4HHB'
}

const StructureViewer = ({ family, pdbData, folding }) => {
    const viewerRef = useRef(null)
    const stageRef = useRef(null)

    const pdbId = getPdbForFamily(family)
    const isPredicted = !!pdbData

    useEffect(() => {
        if (!viewerRef.current) return

        // Initialize NGL Stage
        if (!stageRef.current) {
            const stage = new NGL.Stage(viewerRef.current, { backgroundColor: "#F5F1EC" })
            stageRef.current = stage
            window.addEventListener('resize', () => stage.handleResize())
        }

        const stage = stageRef.current
        stage.removeAllComponents()

        if (pdbData) {
            // Load PREDICTED structure from raw PDB text
            const blob = new Blob([pdbData], { type: 'text/plain' })
            stage.loadFile(blob, { ext: 'pdb', defaultRepresentation: false })
                .then((component) => {
                    component.addRepresentation("cartoon", {
                        colorScheme: "bfactor",
                        colorScale: "RdYlGn",
                        aspectRatio: 2.0,
                        scale: 1.5,
                        smoothSheet: true
                    })
                    component.addRepresentation("ball+stick", {
                        sele: "hetero",
                        aspectRatio: 1.5,
                        colorScheme: "element"
                    })
                    component.autoView(800)
                })
                .catch(err => console.error("Failed to load predicted PDB:", err))
        } else {
            // Fallback: load representative structure from RCSB
            stage.loadFile(`rcsb://${pdbId}`, { defaultRepresentation: false })
                .then((component) => {
                    component.addRepresentation("cartoon", {
                        colorScheme: "sstruc",
                        aspectRatio: 2.0,
                        scale: 1.5,
                        smoothSheet: true
                    })
                    component.autoView(800)
                })
                .catch(err => console.error("Failed to load PDB:", err))
        }

    }, [pdbId, pdbData])

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-sand bg-cream">
            <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />

            {/* Folding Loading Overlay */}
            {folding && (
                <div className="absolute inset-0 bg-cream/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-sm font-sans font-medium text-charcoal">Folding protein...</p>
                    <p className="text-xs text-charcoal/40 font-sans mt-1">ESMFold is predicting the 3D structure</p>
                </div>
            )}

            {/* Overlay Label */}
            <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl text-xs text-charcoal/60 border border-sand pointer-events-none font-sans">
                {isPredicted ? (
                    <>
                        <span className="text-sage font-bold">ESMFold</span> — Predicted Structure
                        <span className="ml-1 text-[10px] text-charcoal/40">(color = confidence)</span>
                    </>
                ) : (
                    <>
                        <span className="text-terracotta font-bold">{pdbId}</span> (Representative Structure)
                    </>
                )}
            </div>

            <div className="absolute top-3 right-3 flex flex-col gap-2">
                {isPredicted && (
                    <span className="px-2 py-1 bg-sage/20 text-sage text-[10px] font-sans font-bold rounded-lg border border-sage/30 backdrop-blur">
                        ✨ AI Predicted
                    </span>
                )}
                <button
                    onClick={() => stageRef.current?.autoView()}
                    className="p-1.5 bg-white/80 text-charcoal rounded-lg hover:bg-white transition cursor-pointer border border-sand backdrop-blur"
                    title="Center View"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
            </div>
        </div>
    )
}

export default StructureViewer
