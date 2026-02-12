/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import axios from 'axios'

// Mock Axios
vi.mock('axios')

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

describe('App Component', () => {

    it('renders the header and input section', () => {
        // Mock initial data fetch
        axios.get.mockResolvedValue({ data: [] })

        render(<App />)

        expect(screen.getByText(/ProteinClassify/i)).toBeInTheDocument()
        expect(screen.getByText(/Sequence Input/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Analyze Sequence/i })).toBeInTheDocument()
    })

    it('handles user input and API call', async () => {
        axios.get.mockResolvedValue({ data: [] })

        // Mock prediction response
        const mockPrediction = {
            family: 'Globin',
            confidence: 0.95,
            pca_x: 1.0,
            pca_y: 2.0
        }
        axios.post.mockResolvedValue({ data: mockPrediction })

        render(<App />)

        const textarea = screen.getByPlaceholderText(/>Seq1/i)
        fireEvent.change(textarea, { target: { value: 'MKTVRQ' } })

        const button = screen.getByRole('button', { name: /Analyze Sequence/i })
        fireEvent.click(button)

        // Check loading state (optional, but good)
        expect(button).toBeDisabled()

        // Wait for results
        await waitFor(() => {
            expect(screen.getByText(/Predicted Family/i)).toBeInTheDocument()
            expect(screen.getByText('Globin')).toBeInTheDocument()
            expect(screen.getByText('95%')).toBeInTheDocument()
        })
    })

    it('displays error message on API failure', async () => {
        axios.get.mockResolvedValue({ data: [] })
        axios.post.mockRejectedValue({ response: { data: { error: 'Invalid Sequence' } } })

        render(<App />)

        const textarea = screen.getByPlaceholderText(/>Seq1/i)
        fireEvent.change(textarea, { target: { value: 'BADSEQ' } })

        const button = screen.getByRole('button', { name: /Analyze Sequence/i })
        fireEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText(/ERROR: Invalid Sequence/i)).toBeInTheDocument()
        })
    })
})
