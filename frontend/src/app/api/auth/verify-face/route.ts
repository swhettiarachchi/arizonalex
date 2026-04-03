import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, faceioId, verificationScore } = body;

        if (!userId || !faceioId) {
            return NextResponse.json(
                { error: 'Missing required fields: userId and faceioId' },
                { status: 400 }
            );
        }

        if (typeof verificationScore !== 'number' || verificationScore < 0 || verificationScore > 100) {
            return NextResponse.json(
                { error: 'Invalid verification score' },
                { status: 400 }
            );
        }

        // Determine identity level based on score and role
        let identityLevel = 'verified_citizen';
        if (verificationScore >= 95) {
            identityLevel = 'verified_politician'; // high-score users eligible for politician level
        }

        const verificationData = {
            faceVerified: true,
            faceioId,
            verificationScore,
            verificationDate: new Date().toISOString(),
            identityLevel,
        };

        // In production, this would update the database via the backend API
        // For now we return the verification data for the client to store
        return NextResponse.json({
            success: true,
            verification: verificationData,
            message: 'Face verification successful',
        });
    } catch {
        return NextResponse.json(
            { error: 'Face verification processing failed' },
            { status: 500 }
        );
    }
}

// GET: Check verification status
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // In production, fetch from database
    // For demo, return a default status
    return NextResponse.json({
        faceVerified: false,
        verificationScore: 0,
        identityLevel: 'normal',
    });
}
