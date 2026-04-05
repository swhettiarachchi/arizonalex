import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to check if cookies are being set and read properly
export async function GET(req: NextRequest) {
    const accessToken = req.cookies.get('sb-access-token')?.value;
    const refreshToken = req.cookies.get('sb-refresh-token')?.value;
    const userId = req.cookies.get('user-id')?.value;

    return NextResponse.json({
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        hasRefreshToken: !!refreshToken,
        hasUserId: !!userId,
        userId: userId || null,
    });
}
