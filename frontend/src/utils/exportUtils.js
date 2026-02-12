/**
 * Client-side export utilities for protein analysis results.
 */

/**
 * Export single or batch results as CSV.
 */
export function exportCSV(results, filename = 'protein_analysis.csv') {
    const rows = Array.isArray(results) ? results : [results]

    const headers = ['Name', 'Family', 'Confidence (%)', 'Sequence Length', 'PCA_X', 'PCA_Y', 'Sequence']
    const csvRows = [headers.join(',')]

    for (const r of rows) {
        if (r.error) continue
        const row = [
            `"${(r.name || 'Single Analysis').replace(/"/g, '""')}"`,
            `"${(r.family || '').replace(/"/g, '""')}"`,
            r.confidence != null ? Math.round(r.confidence * 100) : '',
            r.sequence ? r.sequence.length : '',
            r.pca_x != null ? r.pca_x.toFixed(4) : '',
            r.pca_y != null ? r.pca_y.toFixed(4) : '',
            `"${(r.sequence || '').replace(/"/g, '""')}"`
        ]
        csvRows.push(row.join(','))
    }

    const csv = csvRows.join('\n')
    downloadFile(csv, filename, 'text/csv')
}

/**
 * Export current results view as PDF via browser print dialog.
 * Triggers window.print() which users can save as PDF.
 */
export function exportPDF() {
    window.print()
}

/**
 * Helper: trigger a file download from a string.
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
