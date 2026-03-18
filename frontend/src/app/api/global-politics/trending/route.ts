import { NextResponse } from 'next/server';

export async function GET() {
  // In a real app, this might come from a news aggregator or analytics service
  // For the demo, we return data reflecting current research for March 15, 2026.
  const trending = [
    { 
      slug: 'iran', 
      name: 'Iran', 
      flag: 'ir', 
      interestScore: 98, 
      reason: 'Conflict escalation & missile strikes' 
    },
    { 
      slug: 'israel', 
      name: 'Israel', 
      flag: 'il', 
      interestScore: 95, 
      reason: 'Military operations in Lebanon & Gaza' 
    },
    { 
      slug: 'united-states', 
      name: 'United States', 
      flag: 'us', 
      interestScore: 92, 
      reason: 'Middle East intervention & China summit' 
    },
    { 
      slug: 'lebanon', 
      name: 'Lebanon', 
      flag: 'lb', 
      interestScore: 88, 
      reason: 'Beirut evacuation orders & humanitarian crisis' 
    },
    { 
      slug: 'china', 
      name: 'China', 
      flag: 'cn', 
      interestScore: 85, 
      reason: 'Strategic competition with US & energy trade' 
    },
    { 
      slug: 'ukraine', 
      name: 'Ukraine', 
      flag: 'ua', 
      interestScore: 82, 
      reason: 'Ongoing defensive operations & diplomatic efforts' 
    },
    { 
      slug: 'russia', 
      name: 'Russia', 
      flag: 'ru', 
      interestScore: 80, 
      reason: 'Conflict with Ukraine & geopolitical shifts' 
    },
    { 
      slug: 'pakistan', 
      name: 'Pakistan', 
      flag: 'pk', 
      interestScore: 78, 
      reason: 'Economic measures & fuel cost inflation' 
    },
    { 
      slug: 'south-korea', 
      name: 'South Korea', 
      flag: 'kr', 
      interestScore: 75, 
      reason: 'Strategic investment & Hormuz Strait review' 
    },
    { 
      slug: 'saudi-arabia', 
      name: 'Saudi Arabia', 
      flag: 'sa', 
      interestScore: 72, 
      reason: 'Regional defense & oil market stability' 
    }
  ];

  return NextResponse.json({
    trending: trending.sort((a, b) => b.interestScore - a.interestScore),
    lastUpdated: new Date().toISOString()
  });
}
