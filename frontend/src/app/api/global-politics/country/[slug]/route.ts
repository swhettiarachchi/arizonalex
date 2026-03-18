import { NextResponse } from 'next/server';
import { getCountryBySlug } from '@/lib/countries-data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);

  if (!country) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }

  return NextResponse.json({ country });
}
