import { NextResponse } from 'next/server';
import { businessNews } from '@/lib/mock-data';

export async function GET() {
    return NextResponse.json({ news: businessNews });
}
