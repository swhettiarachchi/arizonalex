import { NextResponse } from 'next/server';

// ── Business Polls API ──────────────────────────────────────────────
// Serves business-related polls for the Business Hub polls tab.
// Structure: { polls: Poll[] } where each Poll has options with vote counts.

interface PollOption {
    label: string;
    votes: number;
}

interface BusinessPoll {
    id: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    endDate: string;
}

// Curated Business Polls — professional-grade market sentiment surveys
const BUSINESS_POLLS: BusinessPoll[] = [
    {
        id: 'b1',
        question: 'What is the biggest risk to the economy in 2026?',
        options: [
            { label: 'Inflation remaining elevated', votes: 38400 },
            { label: 'Rising interest rates', votes: 29100 },
            { label: 'Global trade disruptions', votes: 22700 },
            { label: 'Tech sector correction', votes: 14800 },
        ],
        totalVotes: 105000,
        endDate: 'Mar 25, 2026',
    },
    {
        id: 'b2',
        question: 'Which sector will outperform in Q2 2026?',
        options: [
            { label: 'Artificial Intelligence / Tech', votes: 51200 },
            { label: 'Green Energy', votes: 34800 },
            { label: 'Healthcare / Biotech', votes: 22100 },
            { label: 'Financial Services', votes: 18900 },
        ],
        totalVotes: 127000,
        endDate: 'Apr 1, 2026',
    },
    {
        id: 'b3',
        question: 'Will the Fed cut rates before Q3 2026?',
        options: [
            { label: 'Yes — at least one cut', votes: 44300 },
            { label: 'Yes — multiple cuts', votes: 21700 },
            { label: 'No — rates stay unchanged', votes: 31200 },
            { label: 'No — rates will increase', votes: 8800 },
        ],
        totalVotes: 106000,
        endDate: 'Apr 15, 2026',
    },
    {
        id: 'b4',
        question: 'What is the most promising emerging technology for business?',
        options: [
            { label: 'Generative AI & LLMs', votes: 62100 },
            { label: 'Quantum Computing', votes: 18400 },
            { label: 'Blockchain / Web3', votes: 28900 },
            { label: 'Autonomous Systems', votes: 15600 },
        ],
        totalVotes: 125000,
        endDate: 'Apr 20, 2026',
    },
];

export async function GET() {
    try {
        // Add slight randomization to vote counts to simulate live activity
        const enrichedPolls = BUSINESS_POLLS.map(poll => {
            const updatedOptions = poll.options.map(opt => ({
                ...opt,
                votes: opt.votes + Math.floor(Math.random() * 50),
            }));
            const totalVotes = updatedOptions.reduce((sum, o) => sum + o.votes, 0);
            return { ...poll, options: updatedOptions, totalVotes };
        });

        return NextResponse.json({ polls: enrichedPolls });
    } catch (error) {
        console.error('API /business/polls error:', error);
        return NextResponse.json({ polls: BUSINESS_POLLS });
    }
}
