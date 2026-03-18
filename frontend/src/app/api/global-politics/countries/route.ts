import { NextResponse } from 'next/server';
import { allCountries, regions, ideologies } from '@/lib/countries-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const region = searchParams.get('region') || '';
  const ideology = searchParams.get('ideology') || '';
  const minDemocracy = parseFloat(searchParams.get('democracy') || '0');
  const sort = searchParams.get('sort') || 'name';

  let results = allCountries;

  if (q) {
    const query = q.toLowerCase();
    results = results.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.headOfState.name.toLowerCase().includes(query) ||
      c.headOfGovernment?.name.toLowerCase().includes(query) ||
      c.capital.toLowerCase().includes(query)
    );
  }

  if (region) results = results.filter(c => c.region === region);
  if (ideology) {
    results = results.filter(c =>
      c.headOfState.ideology.toLowerCase().includes(ideology.toLowerCase()) ||
      c.headOfGovernment?.ideology.toLowerCase().includes(ideology.toLowerCase())
    );
  }
  if (minDemocracy > 0) results = results.filter(c => c.democracyIndex >= minDemocracy);

  if (sort === 'population') results = [...results].sort((a, b) => b.population - a.population);
  else if (sort === 'democracy') results = [...results].sort((a, b) => b.democracyIndex - a.democracyIndex);
  else results = [...results].sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({
    countries: results.map(c => ({
      name: c.name, slug: c.slug, flag: c.flag, capital: c.capital,
      population: c.population, region: c.region,
      politicalSystem: c.politicalSystem, democracyIndex: c.democracyIndex,
      headOfState: { name: c.headOfState.name, position: c.headOfState.position, photo: c.headOfState.photo },
      headOfGovernment: c.headOfGovernment ? { name: c.headOfGovernment.name, position: c.headOfGovernment.position, photo: c.headOfGovernment.photo } : null,
      famousLeader: c.famousLeader.name,
      risingPolitician: c.risingPoliticians[0]?.name || null,
      aiScores: c.aiScores,
    })),
    total: results.length,
    regions,
    ideologies,
  });
}
