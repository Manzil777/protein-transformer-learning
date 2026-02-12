import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts'
import { useMemo } from 'react'

// Color palette for different protein families
const FAMILY_COLORS = [
    '#8fbc8f', '#c17a4d', '#6b8e7b', '#d4956a', '#7ba695',
    '#b8956a', '#5f9ea0', '#cd8162', '#708090', '#daa060',
    '#778899', '#bc8f8f', '#66cdaa', '#e0976a', '#4682b4',
]

function hashStringToIndex(str, max) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash) % max
}

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isInput = data.label === 'Input Sequence';
        return (
            <div className={`
                px-3 py-2 rounded-xl text-xs shadow-lg backdrop-blur-md border font-sans
                ${isInput ? 'bg-terracotta border-terracotta/50 text-cream' : 'bg-charcoal/90 border-charcoal/70 text-sand'}
            `}>
                <p className="font-bold text-[11px] mb-0.5">{data.label}</p>
                <p className="font-mono opacity-70 text-[10px]">PC1: {data.x.toFixed(2)}, PC2: {data.y.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

const EmbeddingChart = ({ trainingData, currentPoint }) => {
    // Color-code training data by family
    const coloredData = useMemo(() => {
        if (!trainingData) return []
        return trainingData.map(d => ({
            ...d,
            color: FAMILY_COLORS[hashStringToIndex(d.label || '', FAMILY_COLORS.length)]
        }))
    }, [trainingData])

    const data02 = currentPoint ? [currentPoint] : [];

    const renderLegend = () => (
        <ul className="flex justify-center gap-6 text-xs text-charcoal/50 font-sans mt-3">
            <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sage/70" />
                Known Proteins
            </li>
            <li className="flex items-center gap-1.5">
                <span className="w-4 h-4 flex items-center justify-center text-terracotta text-[14px]">★</span>
                Your Input
            </li>
        </ul>
    )

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8E0D5"
                    strokeOpacity={0.5}
                />
                <XAxis
                    type="number" dataKey="x" name="PC1"
                    stroke="#E8E0D5"
                    tick={{ fontSize: 10, fill: '#9BA89F' }}
                    axisLine={{ stroke: '#E8E0D5' }}
                    label={{ value: 'PC1', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#9BA89F' }}
                />
                <YAxis
                    type="number" dataKey="y" name="PC2"
                    stroke="#E8E0D5"
                    tick={{ fontSize: 10, fill: '#9BA89F' }}
                    axisLine={{ stroke: '#E8E0D5' }}
                    label={{ value: 'PC2', position: 'insideTopLeft', offset: -5, fontSize: 10, fill: '#9BA89F' }}
                />
                <ZAxis type="number" range={[25, 25]} />

                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend content={renderLegend} />

                {/* Training Data - color-coded by family */}
                <Scatter name="Known Proteins" data={coloredData} shape="circle">
                    {coloredData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} fillOpacity={0.45} stroke={entry.color} strokeOpacity={0.15} strokeWidth={0.5} />
                    ))}
                </Scatter>

                {/* Current Input - large glowing star */}
                {currentPoint && (
                    <Scatter name="Input Sequence" data={data02} shape="star" fill="#C17A4D" stroke="#fff" strokeWidth={1.5}>
                        <ZAxis type="number" range={[300, 300]} />
                    </Scatter>
                )}
            </ScatterChart>
        </ResponsiveContainer>
    )
}

export default EmbeddingChart
