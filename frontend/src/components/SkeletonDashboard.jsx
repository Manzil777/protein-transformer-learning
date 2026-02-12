const shimmer = 'animate-pulse bg-sand/40 rounded-xl'

const SkeletonDashboard = () => (
    <div className="space-y-6">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-sand shadow-sm">
                <div className={`h - 3 w - 24 ${shimmer} mb - 3`} />
                <div className={`h - 7 w - 48 ${shimmer} `} />
            </div>
            <div className="bg-white rounded-3xl p-6 border border-sand shadow-sm">
                <div className={`h - 3 w - 28 ${shimmer} mb - 3`} />
                <div className="flex items-end gap-2">
                    <div className={`h - 9 w - 20 ${shimmer} `} />
                    <div className={`h - 5 w - 5 ${shimmer} rounded - full mb - 1`} />
                </div>
                <div className={`h - 1.5 w - full ${shimmer} mt - 4`} />
            </div>
        </div>

        {/* AI Insights skeleton */}
        <div className="bg-white rounded-3xl p-6 border border-sand shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-sand">
                <div className={`w - 8 h - 8 ${shimmer} rounded - xl`} />
                <div>
                    <div className={`h - 3.5 w - 20 ${shimmer} mb - 1.5`} />
                    <div className={`h - 2 w - 36 ${shimmer} `} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-4 rounded-2xl border border-sand/30 bg-cream/30">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w - 5 h - 5 ${shimmer} rounded`} />
                            <div className={`h - 2.5 w - 28 ${shimmer} `} />
                        </div>
                        <div className="space-y-1.5">
                            <div className={`h - 2 w - full ${shimmer} `} />
                            <div className={`h - 2 w - 4 / 5 ${shimmer} `} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Embedding Chart skeleton */}
        <div className="bg-white rounded-3xl p-6 border border-sand shadow-sm">
            <div className={`h - 3.5 w - 44 ${shimmer} mb - 2`} />
            <div className={`h - 2.5 w - 64 ${shimmer} mb - 4`} />
            <div className={`h - [280px] w - full ${shimmer} `} />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-sand shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-sand">
                    <div className={`w - 4 h - 4 ${shimmer} rounded`} />
                    <div className={`h - 3 w - 36 ${shimmer} `} />
                </div>
                <div className={`h - [350px] w - full ${shimmer} `} />
            </div>
            <div className="bg-white rounded-3xl p-6 border border-sand shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-sand">
                    <div className={`w - 4 h - 4 ${shimmer} rounded`} />
                    <div className={`h - 3 w - 32 ${shimmer} `} />
                </div>
                <div className={`h - [350px] w - full ${shimmer} `} />
            </div>
        </div>
    </div>
)

export default SkeletonDashboard
