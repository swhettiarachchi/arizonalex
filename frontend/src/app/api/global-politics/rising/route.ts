import { NextResponse } from 'next/server';
import { allCountries } from '@/lib/countries-data';

export async function GET() {
  // Gather all rising politicians across countries, with country context
  const risingPoliticians = allCountries
    .flatMap(country =>
      country.risingPoliticians.map(rp => ({
        name: rp.name,
        photo: rp.photo,
        party: rp.party,
        position: rp.position,
        popularity: rp.popularity,
        prediction: rp.prediction,
        countryName: country.name,
        countrySlug: country.slug,
        countryFlag: country.flag,
        region: country.region,
      }))
    )
    .filter(rp => rp.name && rp.prediction) // Only include entries with full data
    .sort((a, b) => b.popularity - a.popularity); // Sort by popularity desc

  return NextResponse.json({ risingPoliticians });
}
