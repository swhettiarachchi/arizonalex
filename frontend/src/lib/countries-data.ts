// Global Political Leaders - Comprehensive Country Data
export interface Leader {
  name: string; party: string; position: string; age: number;
  education: string; ideology: string; yearsInPower: number;
  photo: string; social?: { twitter?: string; facebook?: string; };
}
export interface RisingPolitician {
  name: string; party: string; position: string; popularity: number;
  photo: string; prediction: string;
}
export interface TimelineEvent {
  year: number; title: string; description: string; type: 'election' | 'event' | 'leader';
}
export interface EconomicIndicator {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
}
export interface EconomyData {
  gdp: string;
  growth: string;
  inflation: string;
  unemployment: string;
  currency: string;
  summary: string;
  indicators: EconomicIndicator[];
  tradingViewSymbol: string;
}
export interface CountryData {
  name: string; slug: string; flag: string; capital: string;
  population: number; region: string; subregion: string;
  politicalSystem: string; constitutionYear: number;
  nextElection: string; democracyIndex: number;
  headOfState: Leader; headOfGovernment: Leader | null;
  oppositionLeader: Leader | null; famousLeader: { name: string; era: string; description: string; photo?: string; };
  risingPoliticians: RisingPolitician[];
  timeline: TimelineEvent[];
  aiScores: { influence: number; popularity: number; stability: number; };
  aiSummary: string;
  economy: EconomyData;
}

// Get dynamic Wikipedia photo via our internal proxy API, falling back to initials if not found
const ph = (name: string) => `/api/avatar?name=${encodeURIComponent(name)}`;

export const countries: CountryData[] = [
  {
    name: 'United States', slug: 'united-states', flag: 'us', capital: 'Washington, D.C.',
    population: 331900000, region: 'Americas', subregion: 'North America',
    politicalSystem: 'Federal Presidential Republic', constitutionYear: 1787,
    nextElection: 'November 2028', democracyIndex: 7.85,
    headOfState: { name: 'Donald Trump', party: 'Republican Party', position: 'President', age: 79, education: 'Wharton School, UPenn', ideology: 'Right-wing Populism', yearsInPower: 2, photo: ph('Donald Trump'), social: { twitter: '@realDonaldTrump' } },
    headOfGovernment: null,
    oppositionLeader: { name: 'Hakeem Jeffries', party: 'Democratic Party', position: 'House Minority Leader', age: 54, education: 'Georgetown University Law', ideology: 'Center-Left', yearsInPower: 3, photo: ph('Hakeem Jeffries') },
    famousLeader: { name: 'Abraham Lincoln', era: '1861–1865', description: 'Preserved the Union and abolished slavery', photo: ph('Abraham Lincoln') },
    risingPoliticians: [
      { name: 'Gavin Newsom', party: 'Democratic', position: 'Governor of California', popularity: 72, photo: ph('Gavin Newsom'), prediction: 'Potential 2028 presidential candidate' },
      { name: 'Ron DeSantis', party: 'Republican', position: 'Governor of Florida', popularity: 68, photo: ph('Ron DeSantis'), prediction: 'Key GOP figure for future races' },
    ],
    timeline: [
      { year: 2024, title: 'Presidential Election', description: 'Donald Trump won the 2024 presidential election', type: 'election' },
      { year: 2020, title: 'Presidential Election', description: 'Joe Biden defeated Donald Trump', type: 'election' },
      { year: 2016, title: 'Presidential Election', description: 'Donald Trump won his first term', type: 'election' },
    ],
    aiScores: { influence: 98, popularity: 62, stability: 72 },
    aiSummary: 'The United States remains the most influential political entity globally. Current political climate is highly polarized with strong partisan divisions on key issues including immigration, economy, and foreign policy.',
    economy: {
      gdp: '$28.7 Trillion', growth: '2.2%', inflation: '2.6%', unemployment: '4.1%', currency: 'USD ($)',
      summary: 'The US economy is the world\'s largest, characterized by high productivity, advanced infrastructure, and significant innovation. It remains the global financial anchor, though it faces long-term challenges in debt management and inequality.',
      indicators: [
        { label: 'Fed Interest Rate', value: '5.25%', change: 'Stable', trend: 'stable' },
        { label: 'Consumer Confidence', value: '104.7', change: '+1.2', trend: 'up' },
        { label: 'Trade Balance', value: '-$67.4B', change: '-$1.2B', trend: 'down' }
      ],
      tradingViewSymbol: 'SPX'
    }
  },
  {
    name: 'United Kingdom', slug: 'united-kingdom', flag: 'gb', capital: 'London',
    population: 67330000, region: 'Europe', subregion: 'Northern Europe',
    politicalSystem: 'Parliamentary Constitutional Monarchy', constitutionYear: 1215,
    nextElection: 'July 2029', democracyIndex: 8.54,
    headOfState: { name: 'King Charles III', party: 'Non-partisan', position: 'Monarch', age: 77, education: 'Cambridge University', ideology: 'Constitutional Monarch', yearsInPower: 3, photo: ph('Charles III') },
    headOfGovernment: { name: 'Keir Starmer', party: 'Labour Party', position: 'Prime Minister', age: 62, education: 'University of Leeds, Oxford', ideology: 'Social Democracy', yearsInPower: 1, photo: ph('Keir Starmer'), social: { twitter: '@Keabormer' } },
    oppositionLeader: { name: 'Kemi Badenoch', party: 'Conservative Party', position: 'Leader of the Opposition', age: 44, education: 'University of Sussex', ideology: 'Centre-Right', yearsInPower: 1, photo: ph('Kemi Badenoch') },
    famousLeader: { name: 'Winston Churchill', era: '1940–1945, 1951–1955', description: 'Led Britain through World War II', photo: ph('Winston Churchill') },
    risingPoliticians: [
      { name: 'Wes Streeting', party: 'Labour', position: 'Health Secretary', popularity: 65, photo: ph('Wes Streeting'), prediction: 'Potential future Labour leader' },
    ],
    timeline: [
      { year: 2024, title: 'General Election', description: 'Labour won a landslide majority under Keir Starmer', type: 'election' },
      { year: 2022, title: 'Queen Elizabeth II Passes', description: 'Charles III becomes King', type: 'event' },
      { year: 2019, title: 'General Election', description: 'Boris Johnson won with large majority', type: 'election' },
    ],
    aiScores: { influence: 85, popularity: 58, stability: 78 },
    aiSummary: 'The UK under Labour is focused on economic recovery post-Brexit. Political stability has improved after years of Conservative leadership changes.',
    economy: {
      gdp: '$3.6 Trillion', growth: '1.2%', inflation: '2.1%', unemployment: '4.3%', currency: 'GBP (£)',
      summary: 'The UK features a highly developed social market and export-oriented economy. It is a global hub for finance (The City) and high-tech manufacturing, currently navigating post-Brexit trade realignments.',
      indicators: [
        { label: 'BoE Rate', value: '4.75%', change: '-0.25%', trend: 'down' },
        { label: 'Retail Sales', value: '+0.5%', change: '+0.2%', trend: 'up' },
        { label: 'Public Debt/GDP', value: '98.2%', change: '+0.4%', trend: 'down' }
      ],
      tradingViewSymbol: 'UK100'
    }
  },
  {
    name: 'Sri Lanka', slug: 'sri-lanka', flag: 'lk', capital: 'Sri Jayawardenepura Kotte',
    population: 22160000, region: 'Asia', subregion: 'South Asia',
    politicalSystem: 'Semi-Presidential Republic', constitutionYear: 1978,
    nextElection: 'August 2029', democracyIndex: 5.70,
    headOfState: { name: 'Anura Kumara Dissanayake', party: 'NPP/JVP', position: 'President', age: 55, education: 'University of Kelaniya', ideology: 'Democratic Socialism', yearsInPower: 1, photo: ph('Anura Kumara Dissanayake'), social: { twitter: '@aborakaboradissanayake' } },
    headOfGovernment: { name: 'Harini Amarasuriya', party: 'NPP', position: 'Prime Minister', age: 54, education: 'University of Edinburgh', ideology: 'Progressive Left', yearsInPower: 1, photo: ph('Harini Amarasuriya') },
    oppositionLeader: { name: 'Sajith Premadasa', party: 'SJB', position: 'Opposition Leader', age: 57, education: 'London School of Economics', ideology: 'Centre-Right', yearsInPower: 4, photo: ph('Sajith Premadasa') },
    famousLeader: { name: 'S.W.R.D. Bandaranaike', era: '1956–1959', description: 'Pioneer of Sri Lankan nationalist politics', photo: ph('S.W.R.D. Bandaranaike') },
    risingPoliticians: [
      { name: 'Namal Rajapaksa', party: 'SLPP', position: 'Former Minister', popularity: 55, photo: ph('Namal Rajapaksa'), prediction: 'Rising figure in the Rajapaksa political dynasty' },
    ],
    timeline: [
      { year: 2024, title: 'Presidential Election', description: 'Anura Kumara Dissanayake won a historic election', type: 'election' },
      { year: 2022, title: 'Economic Crisis', description: 'Massive protests led to President Rajapaksa fleeing', type: 'event' },
      { year: 2019, title: 'Presidential Election', description: 'Gotabaya Rajapaksa elected president', type: 'election' },
    ],
    aiScores: { influence: 35, popularity: 71, stability: 52 },
    aiSummary: 'Sri Lanka is in a critical recovery phase after the 2022 economic crisis. The new NPP government has promised anti-corruption reforms and economic restructuring.',
    economy: {
      gdp: '$84 Billion', growth: '2.5%', inflation: '4.5%', unemployment: '4.2%', currency: 'LKR (Rs)',
      summary: 'Sri Lanka is emerging from its worst economic crisis in decades. The economy is traditionally based on agriculture, textiles, and tourism, with a growing emphasis on digital services and infrastructure.',
      indicators: [
        { label: 'Base Lending Rate', value: '10.5%', change: '-1.0%', trend: 'down' },
        { label: 'Foreign Reserves', value: '$4.9B', change: '+$0.5B', trend: 'up' },
        { label: 'Tea Exports', value: '+12%', change: '+4%', trend: 'up' }
      ],
      tradingViewSymbol: ''
    }
  },
  {
    name: 'France', slug: 'france', flag: 'fr', capital: 'Paris',
    population: 67750000, region: 'Europe', subregion: 'Western Europe',
    politicalSystem: 'Semi-Presidential Republic', constitutionYear: 1958,
    nextElection: 'April 2027', democracyIndex: 8.07,
    headOfState: { name: 'Emmanuel Macron', party: 'Renaissance', position: 'President', age: 47, education: 'ENA, Sciences Po', ideology: 'Centrism / Liberalism', yearsInPower: 8, photo: ph('Emmanuel Macron'), social: { twitter: '@EmmanuelMacron' } },
    headOfGovernment: { name: 'François Bayrou', party: 'MoDem', position: 'Prime Minister', age: 73, education: 'Institut détudes politiques', ideology: 'Centrism', yearsInPower: 0, photo: ph('François Bayrou') },
    oppositionLeader: { name: 'Marine Le Pen', party: 'National Rally', position: 'Opposition Leader', age: 56, education: 'Paris II Panthéon-Assas', ideology: 'Right-wing Populism', yearsInPower: 13, photo: ph('Marine Le Pen') },
    famousLeader: { name: 'Charles de Gaulle', era: '1959–1969', description: 'Founder of the Fifth Republic, WWII hero', photo: ph('Charles de Gaulle') },
    risingPoliticians: [
      { name: 'Jordan Bardella', party: 'National Rally', position: 'Party President', popularity: 74, photo: ph('Jordan Bardella'), prediction: 'Leading candidate for future presidential race' },
    ],
    timeline: [
      { year: 2024, title: 'Snap Parliamentary Elections', description: 'Macron called snap elections after EU parliament results', type: 'election' },
      { year: 2022, title: 'Presidential Election', description: 'Macron re-elected defeating Marine Le Pen', type: 'election' },
      { year: 2017, title: 'Presidential Election', description: 'Emmanuel Macron won his first term', type: 'election' },
    ],
    aiScores: { influence: 82, popularity: 45, stability: 55 },
    aiSummary: 'France faces political fragmentation with no clear majority. Macron\'s centrism is challenged by both the far-right National Rally and the left-wing coalition.',
    economy: {
      gdp: '$3.1 Trillion', growth: '0.9%', inflation: '2.0%', unemployment: '7.2%', currency: 'EUR (€)',
      summary: 'France possesses a diversified economy led by tourism, agriculture, and high-tech industries including aerospace and luxury goods. It maintains a large public sector and extensive social protection.',
      indicators: [
        { label: 'ECB Rate', value: '4.0%', change: 'Stable', trend: 'stable' },
        { label: 'Tourism Revenue', value: '€68B', change: '+€4B', trend: 'up' },
        { label: 'Industrial Output', value: '-0.2%', change: '-0.1%', trend: 'down' }
      ],
      tradingViewSymbol: 'PX1'
    }
  },
  {
    name: 'India', slug: 'india', flag: 'in', capital: 'New Delhi',
    population: 1428600000, region: 'Asia', subregion: 'South Asia',
    politicalSystem: 'Federal Parliamentary Republic', constitutionYear: 1950,
    nextElection: 'May 2029', democracyIndex: 7.18,
    headOfState: { name: 'Droupadi Murmu', party: 'BJP', position: 'President', age: 66, education: 'Rama Devi Women\'s University', ideology: 'Right-wing', yearsInPower: 3, photo: ph('Droupadi Murmu') },
    headOfGovernment: { name: 'Narendra Modi', party: 'BJP', position: 'Prime Minister', age: 75, education: 'Gujarat University', ideology: 'Hindu Nationalism / Right-wing', yearsInPower: 11, photo: ph('Narendra Modi'), social: { twitter: '@naaborendramodi' } },
    oppositionLeader: { name: 'Rahul Gandhi', party: 'Indian National Congress', position: 'Leader of Opposition', age: 55, education: 'Cambridge University', ideology: 'Centre-Left', yearsInPower: 20, photo: ph('Rahul Gandhi') },
    famousLeader: { name: 'Mahatma Gandhi', era: '1920s–1948', description: 'Father of the nation, led independence movement through nonviolence', photo: ph('Mahatma Gandhi') },
    risingPoliticians: [
      { name: 'Yogi Adityanath', party: 'BJP', position: 'Chief Minister of UP', popularity: 70, photo: ph('Yogi Adityanath'), prediction: 'Potential future PM candidate' },
      { name: 'Akhilesh Yadav', party: 'Samajwadi Party', position: 'Former CM of UP', popularity: 58, photo: ph('Akhilesh Yadav'), prediction: 'Key opposition figure' },
    ],
    timeline: [
      { year: 2024, title: 'General Election', description: 'BJP won third consecutive term, Modi continued as PM', type: 'election' },
      { year: 2019, title: 'General Election', description: 'BJP won massive majority', type: 'election' },
      { year: 2014, title: 'General Election', description: 'Narendra Modi first elected as PM', type: 'election' },
    ],
    aiScores: { influence: 88, popularity: 72, stability: 68 },
    aiSummary: 'India under Modi continues to rise as a global power. Strong economic growth but concerns about democratic backsliding and religious tensions persist.',
    economy: {
      gdp: '$4.2 Trillion', growth: '7.5%', inflation: '4.2%', unemployment: '6.8%', currency: 'INR (₹)',
      summary: 'India is the world\'s fastest-growing major economy. It has transitioned from a protected socialist economy to a massive market-oriented one, with strengths in IT services, pharmaceuticals, and manufacturing.',
      indicators: [
        { label: 'RBI Repo Rate', value: '6.5%', change: 'Stable', trend: 'stable' },
        { label: 'FDI Inflow', value: '$82B', change: '+$5B', trend: 'up' },
        { label: 'GST Collection', value: '₹1.8T', change: '+12%', trend: 'up' }
      ],
      tradingViewSymbol: 'NIFTY'
    }
  },
  {
    name: 'China', slug: 'china', flag: 'cn', capital: 'Beijing',
    population: 1425900000, region: 'Asia', subregion: 'East Asia',
    politicalSystem: 'One-Party Socialist Republic', constitutionYear: 1982,
    nextElection: 'N/A (One-party state)', democracyIndex: 1.94,
    headOfState: { name: 'Xi Jinping', party: 'Chinese Communist Party', position: 'President & General Secretary', age: 72, education: 'Tsinghua University', ideology: 'Marxism-Leninism / Xi Jinping Thought', yearsInPower: 12, photo: ph('Xi Jinping') },
    headOfGovernment: { name: 'Li Qiang', party: 'CCP', position: 'Premier', age: 65, education: 'Zhejiang University', ideology: 'State Capitalism', yearsInPower: 2, photo: ph('Li Qiang') },
    oppositionLeader: null,
    famousLeader: { name: 'Mao Zedong', era: '1949–1976', description: 'Founder of the People\'s Republic of China', photo: ph('Mao Zedong') },
    risingPoliticians: [],
    timeline: [
      { year: 2022, title: 'Xi\'s Third Term', description: 'Xi Jinping secured unprecedented third term', type: 'event' },
      { year: 2018, title: 'Term Limits Removed', description: 'Constitutional amendment removed presidential term limits', type: 'event' },
      { year: 2012, title: 'Xi Takes Power', description: 'Xi Jinping became General Secretary', type: 'leader' },
    ],
    aiScores: { influence: 95, popularity: 0, stability: 82 },
    aiSummary: 'China under Xi Jinping has consolidated power unprecedented in the post-Mao era. Economic slowdown and US-China tensions define the current political landscape.',
    economy: {
      gdp: '$19.2 Trillion', growth: '4.5%', inflation: '1.2%', unemployment: '5.1%', currency: 'CNY (¥)',
      summary: 'China has the world\'s second-largest economy by nominal GDP and the largest by PPP. It is the global leader in manufacturing and exports, though it is currently transitioning toward a more consumption-led model.',
      indicators: [
        { label: 'PBoC LPR', value: '3.45%', change: '-0.1%', trend: 'down' },
        { label: 'Tech Spending', value: '$450B', change: '+15%', trend: 'up' },
        { label: 'Property Index', value: '78.5', change: '-4.2', trend: 'down' }
      ],
      tradingViewSymbol: 'SSE:000001'
    }
  },
  {
    name: 'Russia', slug: 'russia', flag: 'ru', capital: 'Moscow',
    population: 144100000, region: 'Europe', subregion: 'Eastern Europe',
    politicalSystem: 'Federal Semi-Presidential Republic', constitutionYear: 1993,
    nextElection: 'March 2030', democracyIndex: 2.22,
    headOfState: { name: 'Vladimir Putin', party: 'United Russia', position: 'President', age: 72, education: 'Leningrad State University', ideology: 'Authoritarian Conservatism', yearsInPower: 24, photo: ph('Vladimir Putin') },
    headOfGovernment: { name: 'Mikhail Mishustin', party: 'United Russia', position: 'Prime Minister', age: 58, education: 'Moscow Machine Tool Institute', ideology: 'Technocratic', yearsInPower: 5, photo: ph('Mikhail Mishustin') },
    oppositionLeader: null,
    famousLeader: { name: 'Vladimir Lenin', era: '1917–1924', description: 'Led the October Revolution and founded the Soviet state', photo: ph('Vladimir Lenin') },
    risingPoliticians: [],
    timeline: [
      { year: 2024, title: 'Presidential Election', description: 'Putin won re-election with reported 87% of the vote', type: 'election' },
      { year: 2022, title: 'Ukraine Invasion', description: 'Russia launched full-scale invasion of Ukraine', type: 'event' },
      { year: 2020, title: 'Constitutional Reform', description: 'Referendum extended Putin\'s potential rule to 2036', type: 'event' },
    ],
    aiScores: { influence: 78, popularity: 0, stability: 45 },
    aiSummary: 'Russia remains under Putin\'s authoritarian rule with the ongoing Ukraine conflict dominating politics. International isolation and sanctions continue.',
    economy: {
      gdp: '$2.1 Trillion', growth: '1.5%', inflation: '7.2%', unemployment: '3.0%', currency: 'RUB (₽)',
      summary: 'The Russian economy is heavily reliant on natural resources, particularly oil and gas. It is currently operating as a "war economy" due to the conflict in Ukraine and unprecedented international sanctions.',
      indicators: [
        { label: 'Central Bank Rate', value: '16.0%', change: 'Stable', trend: 'stable' },
        { label: 'Oil Price (Urals)', value: '$72.5', change: '+$2.1', trend: 'up' },
        { label: 'Defense Budget', value: '39% Govt', change: '+5%', trend: 'up' }
      ],
      tradingViewSymbol: 'MOEX'
    }
  },
  {
    name: 'Germany', slug: 'germany', flag: 'de', capital: 'Berlin',
    population: 84360000, region: 'Europe', subregion: 'Western Europe',
    politicalSystem: 'Federal Parliamentary Republic', constitutionYear: 1949,
    nextElection: 'September 2029', democracyIndex: 8.80,
    headOfState: { name: 'Frank-Walter Steinmeier', party: 'SPD', position: 'President', age: 69, education: 'University of Giessen', ideology: 'Social Democracy', yearsInPower: 8, photo: ph('Frank-Walter Steinmeier') },
    headOfGovernment: { name: 'Friedrich Merz', party: 'CDU/CSU', position: 'Chancellor', age: 69, education: 'University of Bonn', ideology: 'Conservative', yearsInPower: 0, photo: ph('Friedrich Merz'), social: { twitter: '@_FriedrichMerz' } },
    oppositionLeader: { name: 'Alice Weidel', party: 'AfD', position: 'Party Leader', age: 46, education: 'University of Bayreuth', ideology: 'Right-wing Populism', yearsInPower: 7, photo: ph('Alice Weidel') },
    famousLeader: { name: 'Konrad Adenauer', era: '1949–1963', description: 'First Chancellor of West Germany, led post-war reconstruction', photo: ph('Konrad Adenauer') },
    risingPoliticians: [
      { name: 'Robert Habeck', party: 'Greens', position: 'Former Vice Chancellor', popularity: 52, photo: ph('Robert Habeck'), prediction: 'Remains influential in green politics' },
    ],
    timeline: [
      { year: 2025, title: 'Federal Election', description: 'CDU/CSU won under Friedrich Merz', type: 'election' },
      { year: 2021, title: 'Federal Election', description: 'SPD won, Olaf Scholz became Chancellor', type: 'election' },
      { year: 2017, title: 'Federal Election', description: 'Angela Merkel won fourth term', type: 'election' },
    ],
    aiScores: { influence: 80, popularity: 55, stability: 75 },
    aiSummary: 'Germany under new Chancellor Merz is refocusing on economic competitiveness and defense spending. The rise of AfD has reshaped German political discourse.',
    economy: {
      gdp: '$4.7 Trillion', growth: '0.8%', inflation: '1.8%', unemployment: '5.7%', currency: 'EUR (€)',
      summary: 'Germany is the largest national economy in Europe. It is a leading global exporter of machinery, vehicles, and chemicals, benefiting from a highly skilled workforce and strong industrial base.',
      indicators: [
        { label: 'Manufacturing PMI', value: '46.2', change: '+1.5', trend: 'up' },
        { label: 'Energy Cost Index', value: '112.4', change: '-10%', trend: 'down' },
        { label: 'Auto Exports', value: '€142B', change: '+€5B', trend: 'up' }
      ],
      tradingViewSymbol: 'DAX'
    }
  },
  {
    name: 'Japan', slug: 'japan', flag: 'jp', capital: 'Tokyo',
    population: 125100000, region: 'Asia', subregion: 'East Asia',
    politicalSystem: 'Parliamentary Constitutional Monarchy', constitutionYear: 1947,
    nextElection: 'July 2028', democracyIndex: 8.33,
    headOfState: { name: 'Emperor Naruhito', party: 'Non-partisan', position: 'Emperor', age: 65, education: 'Oxford University', ideology: 'Constitutional Monarch', yearsInPower: 6, photo: ph('Emperor Naruhito') },
    headOfGovernment: { name: 'Shigeru Ishiba', party: 'LDP', position: 'Prime Minister', age: 67, education: 'Keio University', ideology: 'Conservative', yearsInPower: 1, photo: ph('Shigeru Ishiba') },
    oppositionLeader: { name: 'Yoshihiko Noda', party: 'CDP', position: 'Opposition Leader', age: 67, education: 'Waseda University', ideology: 'Centre-Left', yearsInPower: 2, photo: ph('Yoshihiko Noda') },
    famousLeader: { name: 'Shinzo Abe', era: '2006–2007, 2012–2020', description: 'Japan\'s longest-serving PM, architect of Abenomics', photo: ph('Shinzo Abe') },
    risingPoliticians: [
      { name: 'Taro Kono', party: 'LDP', position: 'Digital Minister', popularity: 62, photo: ph('Taro Kono'), prediction: 'Future PM contender' },
    ],
    timeline: [
      { year: 2024, title: 'LDP Leadership Election', description: 'Shigeru Ishiba became LDP leader and PM', type: 'leader' },
      { year: 2022, title: 'Shinzo Abe Assassinated', description: 'Former PM assassinated during campaign speech', type: 'event' },
      { year: 2021, title: 'PM Transition', description: 'Fumio Kishida became Prime Minister', type: 'leader' },
    ],
    aiScores: { influence: 72, popularity: 48, stability: 80 },
    aiSummary: 'Japan faces challenges from aging demographics and regional security concerns. PM Ishiba is navigating US-Japan alliance dynamics and economic reform.',
    economy: {
      gdp: '$4.4 Trillion', growth: '1.1%', inflation: '2.1%', unemployment: '2.5%', currency: 'JPY (¥)',
      summary: 'Japan has a highly developed, export-oriented economy with a strong focus on high-tech industries, automotive manufacturing, and robotics. It faces unique challenges from long-term deflationary pressure and an aging population.',
      indicators: [
        { label: 'BoJ Policy Rate', value: '0.1%', change: '+0.1%', trend: 'up' },
        { label: 'Nikkei 225 P/E', value: '15.8', change: 'Stable', trend: 'stable' },
        { label: 'Semiconductor Inv', value: '¥2.4T', change: '+20%', trend: 'up' }
      ],
      tradingViewSymbol: 'NI225'
    }
  },
  {
    name: 'Brazil', slug: 'brazil', flag: 'br', capital: 'Brasília',
    population: 214300000, region: 'Americas', subregion: 'South America',
    politicalSystem: 'Federal Presidential Republic', constitutionYear: 1988,
    nextElection: 'October 2026', democracyIndex: 6.78,
    headOfState: { name: 'Luiz Inácio Lula da Silva', party: 'PT (Workers\' Party)', position: 'President', age: 79, education: 'Self-educated / Metalworker', ideology: 'Left-wing / Social Democracy', yearsInPower: 3, photo: ph('Lula da Silva'), social: { twitter: '@LuolaOficial' } },
    headOfGovernment: null,
    oppositionLeader: { name: 'Jair Bolsonaro', party: 'PL', position: 'Former President', age: 70, education: 'Military Academy', ideology: 'Right-wing Populism', yearsInPower: 4, photo: ph('Jair Bolsonaro') },
    famousLeader: { name: 'Getúlio Vargas', era: '1930–1945, 1951–1954', description: 'Father of modern Brazil, longest-ruling leader', photo: ph('Getúlio Vargas') },
    risingPoliticians: [
      { name: 'Tarcísio de Freitas', party: 'Republicans', position: 'Governor of São Paulo', popularity: 68, photo: ph('Tarcísio de Freitas'), prediction: 'Leading right-wing candidate for 2026' },
    ],
    timeline: [
      { year: 2022, title: 'Presidential Election', description: 'Lula defeated Bolsonaro in a tight runoff', type: 'election' },
      { year: 2023, title: 'January 8 Riots', description: 'Bolsonaro supporters stormed government buildings', type: 'event' },
      { year: 2018, title: 'Presidential Election', description: 'Jair Bolsonaro elected president', type: 'election' },
    ],
    aiScores: { influence: 72, popularity: 55, stability: 58 },
    aiSummary: 'Brazil under Lula is rebuilding international relationships and environmental policies. Deep political polarization between left and right persists.',
    economy: {
      gdp: '$2.5 Trillion', growth: '2.2%', inflation: '3.8%', unemployment: '7.3%', currency: 'BRL (R$)',
      summary: 'Brazil is the largest economy in Latin America, with significant strengths in agriculture, mining, and manufacturing. It is a major global exporter of iron ore, soy, and coffee.',
      indicators: [
        { label: 'Selic Rate', value: '11.25%', change: '-0.5%', trend: 'down' },
        { label: 'Agri Exports', value: '+8%', change: '+2%', trend: 'up' },
        { label: 'Primary Surplus', value: '1.2% GDP', change: '+0.2%', trend: 'up' }
      ],
      tradingViewSymbol: 'IBOV'
    }
  },
];

// Generate remaining countries with realistic but condensed data
const moreCountries: Partial<CountryData>[] = [
  { name: 'Australia', slug: 'australia', flag: 'au', capital: 'Canberra', population: 26440000, region: 'Oceania', subregion: 'Australia and NZ', politicalSystem: 'Federal Parliamentary Constitutional Monarchy', constitutionYear: 1901, nextElection: 'May 2025', democracyIndex: 8.71, headOfState: { name: 'King Charles III', party: 'Non-partisan', position: 'Monarch', age: 77, education: 'Cambridge', ideology: 'Constitutional Monarch', yearsInPower: 3, photo: ph('Charles III') }, headOfGovernment: { name: 'Anthony Albanese', party: 'Labor', position: 'PM', age: 61, education: 'University of Sydney', ideology: 'Centre-Left', yearsInPower: 3, photo: ph('Anthony Albanese') }, famousLeader: { name: 'Robert Menzies', era: '1939–1941, 1949–1966', description: 'Longest-serving Australian PM', photo: ph('Robert Menzies') }, risingPoliticians: [{ name: 'Peter Dutton', party: 'Liberal', position: 'Opposition Leader', popularity: 62, photo: ph('Peter Dutton'), prediction: 'Main challenger in 2025 election' }] },
  { name: 'Canada', slug: 'canada', flag: 'ca', capital: 'Ottawa', population: 40100000, region: 'Americas', subregion: 'North America', politicalSystem: 'Federal Parliamentary Constitutional Monarchy', constitutionYear: 1867, nextElection: 'October 2025', democracyIndex: 8.88, headOfState: { name: 'King Charles III', party: 'Non-partisan', position: 'Monarch', age: 77, education: 'Cambridge', ideology: 'Constitutional Monarch', yearsInPower: 3, photo: ph('Charles III') }, headOfGovernment: { name: 'Mark Carney', party: 'Liberal Party', position: 'PM', age: 60, education: 'Harvard, Oxford', ideology: 'Centrism', yearsInPower: 0, photo: ph('Mark Carney') }, famousLeader: { name: 'Pierre Trudeau', era: '1968–1979, 1980–1984', description: 'Iconic Canadian leader, Charter of Rights', photo: ph('Pierre Trudeau') }, risingPoliticians: [{ name: 'Pierre Poilievre', party: 'Conservative', position: 'Opposition Leader', popularity: 78, photo: ph('Pierre Poilievre'), prediction: 'Likely next Prime Minister' }] },
  { name: 'South Korea', slug: 'south-korea', flag: 'kr', capital: 'Seoul', population: 51740000, region: 'Asia', subregion: 'East Asia', politicalSystem: 'Presidential Republic', constitutionYear: 1987, nextElection: 'June 2025', democracyIndex: 8.16, headOfState: { name: 'Han Duck-soo (Acting)', party: 'PPP', position: 'Acting President', age: 75, education: 'Harvard', ideology: 'Conservative', yearsInPower: 0, photo: ph('Han Duck-soo') }, headOfGovernment: null, famousLeader: { name: 'Park Chung-hee', era: '1963–1979', description: 'Led South Korea\'s rapid industrialization', photo: ph('Park Chung-hee') } },
  { name: 'Mexico', slug: 'mexico', flag: 'mx', capital: 'Mexico City', population: 128900000, region: 'Americas', subregion: 'Central America', politicalSystem: 'Federal Presidential Republic', constitutionYear: 1917, nextElection: 'June 2030', democracyIndex: 5.57, headOfState: { name: 'Claudia Sheinbaum', party: 'Morena', position: 'President', age: 62, education: 'UC Berkeley PhD', ideology: 'Left-wing', yearsInPower: 1, photo: ph('Claudia Sheinbaum') }, headOfGovernment: null, famousLeader: { name: 'Benito Juárez', era: '1858–1872', description: 'Indigenous president who defended Mexican sovereignty', photo: ph('Benito Juárez') } },
  { name: 'Italy', slug: 'italy', flag: 'it', capital: 'Rome', population: 59110000, region: 'Europe', subregion: 'Southern Europe', politicalSystem: 'Parliamentary Republic', constitutionYear: 1948, nextElection: 'June 2027', democracyIndex: 7.69, headOfState: { name: 'Sergio Mattarella', party: 'Non-partisan', position: 'President', age: 83, education: 'La Sapienza University', ideology: 'Centrist', yearsInPower: 10, photo: ph('Sergio Mattarella') }, headOfGovernment: { name: 'Giorgia Meloni', party: 'FdI', position: 'PM', age: 48, education: 'Journalist', ideology: 'Right-wing', yearsInPower: 3, photo: ph('Giorgia Meloni') }, famousLeader: { name: 'Alcide De Gasperi', era: '1945–1953', description: 'Father of the Italian Republic and EU founding father', photo: ph('Alcide De Gasperi') } },
  { name: 'Spain', slug: 'spain', flag: 'es', capital: 'Madrid', population: 47420000, region: 'Europe', subregion: 'Southern Europe', politicalSystem: 'Parliamentary Constitutional Monarchy', constitutionYear: 1978, nextElection: 'December 2027', democracyIndex: 7.94, headOfState: { name: 'King Felipe VI', party: 'Non-partisan', position: 'Monarch', age: 57, education: 'Georgetown University', ideology: 'Constitutional Monarch', yearsInPower: 11, photo: ph('King Felipe VI') }, headOfGovernment: { name: 'Pedro Sánchez', party: 'PSOE', position: 'PM', age: 53, education: 'Economics PhD', ideology: 'Social Democracy', yearsInPower: 7, photo: ph('Pedro Sánchez') }, famousLeader: { name: 'Adolfo Suárez', era: '1976–1981', description: 'Led Spain\'s democratic transition', photo: ph('Adolfo Suárez') } },
  { name: 'South Africa', slug: 'south-africa', flag: 'za', capital: 'Pretoria', population: 60414000, region: 'Africa', subregion: 'Southern Africa', politicalSystem: 'Parliamentary Republic', constitutionYear: 1996, nextElection: 'May 2029', democracyIndex: 7.05, headOfState: { name: 'Cyril Ramaphosa', party: 'ANC', position: 'President', age: 72, education: 'University of South Africa', ideology: 'Centre-Left', yearsInPower: 7, photo: ph('Cyril Ramaphosa') }, headOfGovernment: null, famousLeader: { name: 'Nelson Mandela', era: '1994–1999', description: 'First post-apartheid president, icon of freedom', photo: ph('Nelson Mandela') } },
  { name: 'Turkey', slug: 'turkey', flag: 'tr', capital: 'Ankara', population: 85280000, region: 'Asia', subregion: 'Western Asia', politicalSystem: 'Presidential Republic', constitutionYear: 1982, nextElection: 'June 2028', democracyIndex: 4.35, headOfState: { name: 'Recep Tayyip Erdoğan', party: 'AKP', position: 'President', age: 71, education: 'Marmara University', ideology: 'Conservative / Islamism', yearsInPower: 22, photo: ph('Recep Tayyip Erdogan') }, headOfGovernment: null, famousLeader: { name: 'Mustafa Kemal Atatürk', era: '1923–1938', description: 'Founder of modern Turkey', photo: ph('Mustafa Kemal Atatürk') } },
  { name: 'Nigeria', slug: 'nigeria', flag: 'ng', capital: 'Abuja', population: 223800000, region: 'Africa', subregion: 'West Africa', politicalSystem: 'Federal Presidential Republic', constitutionYear: 1999, nextElection: 'February 2027', democracyIndex: 4.11, headOfState: { name: 'Bola Tinubu', party: 'APC', position: 'President', age: 72, education: 'Chicago State University', ideology: 'Centre-Right', yearsInPower: 2, photo: ph('Bola Tinubu') }, headOfGovernment: null, famousLeader: { name: 'Nnamdi Azikiwe', era: '1963–1966', description: 'First President of Nigeria', photo: ph('Nnamdi Azikiwe') } },
  { name: 'Egypt', slug: 'egypt', flag: 'eg', capital: 'Cairo', population: 104300000, region: 'Africa', subregion: 'North Africa', politicalSystem: 'Presidential Republic', constitutionYear: 2014, nextElection: 'December 2030', democracyIndex: 2.93, headOfState: { name: 'Abdel Fattah el-Sisi', party: 'Independent', position: 'President', age: 70, education: 'Egyptian Military Academy', ideology: 'Authoritarianism', yearsInPower: 11, photo: ph('Abdel Fattah el-Sisi') }, headOfGovernment: { name: 'Mostafa Madbouly', party: 'Independent', position: 'PM', age: 59, education: 'Cairo University', ideology: 'Technocratic', yearsInPower: 7, photo: ph('Mostafa Madbouly') }, famousLeader: { name: 'Gamal Abdel Nasser', era: '1954–1970', description: 'Pan-Arab nationalist leader', photo: ph('Gamal Abdel Nasser') } },
  { name: 'Argentina', slug: 'argentina', flag: 'ar', capital: 'Buenos Aires', population: 45810000, region: 'Americas', subregion: 'South America', politicalSystem: 'Federal Presidential Republic', constitutionYear: 1853, nextElection: 'October 2027', democracyIndex: 6.85, headOfState: { name: 'Javier Milei', party: 'La Libertad Avanza', position: 'President', age: 54, education: 'University of Belgrano', ideology: 'Libertarianism / Right-wing', yearsInPower: 1, photo: ph('Javier Milei') }, headOfGovernment: null, famousLeader: { name: 'Juan Perón', era: '1946–1955, 1973–1974', description: 'Founder of Peronism, most influential Argentine politician', photo: ph('Juan Perón') } },
  { name: 'Indonesia', slug: 'indonesia', flag: 'id', capital: 'Jakarta', population: 275500000, region: 'Asia', subregion: 'Southeast Asia', politicalSystem: 'Presidential Republic', constitutionYear: 1945, nextElection: 'February 2029', democracyIndex: 6.71, headOfState: { name: 'Prabowo Subianto', party: 'Gerindra', position: 'President', age: 73, education: 'Indonesian Military Academy', ideology: 'Nationalist', yearsInPower: 1, photo: ph('Prabowo Subianto') }, headOfGovernment: null, famousLeader: { name: 'Sukarno', era: '1945–1967', description: 'Founding father and first president of Indonesia', photo: ph('Sukarno') } },
  { name: 'Saudi Arabia', slug: 'saudi-arabia', flag: 'sa', capital: 'Riyadh', population: 36950000, region: 'Asia', subregion: 'Western Asia', politicalSystem: 'Absolute Monarchy', constitutionYear: 1992, nextElection: 'N/A (Monarchy)', democracyIndex: 2.08, headOfState: { name: 'King Salman', party: 'House of Saud', position: 'King', age: 89, education: 'Private tutoring', ideology: 'Islamic Conservatism', yearsInPower: 10, photo: ph('King Salman') }, headOfGovernment: { name: 'Mohammed bin Salman', party: 'House of Saud', position: 'Crown Prince & PM', age: 39, education: 'King Saud University', ideology: 'Modernizing Autocracy', yearsInPower: 8, photo: ph('Mohammed bin Salman') }, famousLeader: { name: 'King Abdulaziz', era: '1932–1953', description: 'Founder of modern Saudi Arabia', photo: ph('King Abdulaziz') } },
  { name: 'Pakistan', slug: 'pakistan', flag: 'pk', capital: 'Islamabad', population: 229000000, region: 'Asia', subregion: 'South Asia', politicalSystem: 'Federal Parliamentary Republic', constitutionYear: 1973, nextElection: 'February 2029', democracyIndex: 4.13, headOfState: { name: 'Asif Ali Zardari', party: 'PPP', position: 'President', age: 69, education: 'London Business School', ideology: 'Centre-Left', yearsInPower: 1, photo: ph('Asif Ali Zardari') }, headOfGovernment: { name: 'Shehbaz Sharif', party: 'PML-N', position: 'PM', age: 73, education: 'Government College Lahore', ideology: 'Centre-Right', yearsInPower: 1, photo: ph('Shehbaz Sharif') }, famousLeader: { name: 'Muhammad Ali Jinnah', era: '1947–1948', description: 'Founder of Pakistan', photo: ph('Muhammad Ali Jinnah') } },
  { name: 'Ukraine', slug: 'ukraine', flag: 'ua', capital: 'Kyiv', population: 38000000, region: 'Europe', subregion: 'Eastern Europe', politicalSystem: 'Semi-Presidential Republic', constitutionYear: 1996, nextElection: 'TBD (Martial Law)', democracyIndex: 5.06, headOfState: { name: 'Volodymyr Zelenskyy', party: 'Servant of the People', position: 'President', age: 47, education: 'Kyiv National Economic University', ideology: 'Liberalism / Centrism', yearsInPower: 6, photo: ph('Volodymyr Zelenskyy') }, headOfGovernment: { name: 'Denys Shmyhal', party: 'Independent', position: 'PM', age: 49, education: 'Lviv Polytechnic', ideology: 'Technocratic', yearsInPower: 5, photo: ph('Denys Shmyhal Ukraine') }, famousLeader: { name: 'Taras Shevchenko', era: '1814–1861', description: 'National poet and figure of Ukrainian independence', photo: ph('Taras Shevchenko') } },
  { name: 'Israel', slug: 'israel', flag: 'il', capital: 'Jerusalem (Limited recognition)', population: 9800000, region: 'Asia', subregion: 'Western Asia', politicalSystem: 'Parliamentary Republic', constitutionYear: 1948, nextElection: 'October 2026', democracyIndex: 7.80, headOfState: { name: 'Isaac Herzog', party: 'Labor', position: 'President', age: 64, education: 'Tel Aviv University', ideology: 'Centrism', yearsInPower: 4, photo: ph('Isaac Herzog') }, headOfGovernment: { name: 'Benjamin Netanyahu', party: 'Likud', position: 'PM', age: 75, education: 'MIT', ideology: 'Right-wing', yearsInPower: 17, photo: ph('Benjamin Netanyahu') }, famousLeader: { name: 'David Ben-Gurion', era: '1948–1963', description: 'Primary founder of the State of Israel', photo: ph('David Ben-Gurion') } },
  { name: 'Poland', slug: 'poland', flag: 'pl', capital: 'Warsaw', population: 37750000, region: 'Europe', subregion: 'Eastern Europe', politicalSystem: 'Parliamentary Republic', constitutionYear: 1997, nextElection: 'May 2025', democracyIndex: 7.18, headOfState: { name: 'Andrzej Duda', party: 'Independent', position: 'President', age: 52, education: 'Jagiellonian University', ideology: 'Conservative', yearsInPower: 10, photo: ph('Andrzej Duda') }, headOfGovernment: { name: 'Donald Tusk', party: 'PO', position: 'PM', age: 67, education: 'University of Gdańsk', ideology: 'Centrism', yearsInPower: 2, photo: ph('Donald Tusk') }, famousLeader: { name: 'Lech Wałęsa', era: '1990–1995', description: 'Leader of Solidarity movement, Nobel Peace Prize', photo: ph('Lech Wałęsa') } },
  { name: 'Thailand', slug: 'thailand', flag: 'th', capital: 'Bangkok', population: 71600000, region: 'Asia', subregion: 'Southeast Asia', politicalSystem: 'Constitutional Monarchy', constitutionYear: 2017, nextElection: 'May 2027', democracyIndex: 6.67, headOfState: { name: 'Vajiralongkorn', party: 'Non-partisan', position: 'Monarch', age: 72, education: 'Royal Military College', ideology: 'Constitutional Monarch', yearsInPower: 9, photo: ph('Vajiralongkorn') }, headOfGovernment: { name: 'Paetongtarn Shinawatra', party: 'Pheu Thai', position: 'PM', age: 38, education: 'University of Surrey', ideology: 'Populism', yearsInPower: 1, photo: ph('Paetongtarn Shinawatra') }, famousLeader: { name: 'King Bhumibol', era: '1946–2016', description: 'Longest-reigning monarch, symbol of stability', photo: ph('King Bhumibol') } },
  { name: 'Iran', slug: 'iran', flag: 'ir', capital: 'Tehran', population: 88550000, region: 'Asia', subregion: 'Western Asia', politicalSystem: 'Islamic Republic', constitutionYear: 1979, nextElection: 'June 2028', democracyIndex: 1.96, headOfState: { name: 'Ali Khamenei', party: 'Combatant Clergy Association', position: 'Supreme Leader', age: 85, education: 'Religious studies', ideology: 'Islamism', yearsInPower: 36, photo: ph('Ali Khamenei') }, headOfGovernment: { name: 'Masoud Pezeshkian', party: 'Reformist', position: 'President', age: 70, education: 'Tabriz University', ideology: 'Reformist', yearsInPower: 1, photo: ph('Masoud Pezeshkian') }, famousLeader: { name: 'Ruhollah Khomeini', era: '1979–1989', description: 'Leader of the Islamic Revolution', photo: ph('Ruhollah Khomeini') } },
  { name: 'Philippines', slug: 'philippines', flag: 'ph', capital: 'Manila', population: 115600000, region: 'Asia', subregion: 'Southeast Asia', politicalSystem: 'Presidential Republic', constitutionYear: 1987, nextElection: 'May 2028', democracyIndex: 6.66, headOfState: { name: 'Bongbong Marcos', party: 'PFP', position: 'President', age: 67, education: 'Oxford University', ideology: 'Conservative', yearsInPower: 3, photo: ph('Bongbong Marcos') }, headOfGovernment: null, famousLeader: { name: 'Corazon Aquino', era: '1986–1992', description: 'First female president, icon of democracy', photo: ph('Corazon Aquino') } },
  { name: 'Colombia', slug: 'colombia', flag: 'co', capital: 'Bogotá', population: 51870000, region: 'Americas', subregion: 'South America', politicalSystem: 'Presidential Republic', constitutionYear: 1991, nextElection: 'May 2026', democracyIndex: 6.98, headOfState: { name: 'Gustavo Petro', party: 'Humane Colombia', position: 'President', age: 64, education: 'Universidad Externado', ideology: 'Left-wing', yearsInPower: 3, photo: ph('Gustavo Petro') }, headOfGovernment: null, famousLeader: { name: 'Simón Bolívar', era: '1819–1830', description: 'The Liberator of several South American nations', photo: ph('Simón Bolívar') } },
  { name: 'Kenya', slug: 'kenya', flag: 'ke', capital: 'Nairobi', population: 55100000, region: 'Africa', subregion: 'East Africa', politicalSystem: 'Presidential Republic', constitutionYear: 2010, nextElection: 'August 2027', democracyIndex: 5.33, headOfState: { name: 'William Ruto', party: 'UDA', position: 'President', age: 57, education: 'University of Nairobi', ideology: 'Centre-Right', yearsInPower: 3, photo: ph('William Ruto') }, headOfGovernment: null, famousLeader: { name: 'Jomo Kenyatta', era: '1963–1978', description: 'Father of the nation and first president', photo: ph('Jomo Kenyatta') } },
  { name: 'Bangladesh', slug: 'bangladesh', flag: 'bd', capital: 'Dhaka', population: 169400000, region: 'Asia', subregion: 'South Asia', politicalSystem: 'Parliamentary Republic', constitutionYear: 1972, nextElection: 'TBD', democracyIndex: 5.99, headOfState: { name: 'Mohammed Shahabuddin', party: 'Non-partisan', position: 'President', age: 75, education: 'University of Dhaka', ideology: 'Neutral', yearsInPower: 2, photo: ph('Mohammed Shahabuddin') }, headOfGovernment: { name: 'Muhammad Yunus', party: 'Interim Government', position: 'Chief Adviser', age: 84, education: 'Vanderbilt University', ideology: 'Social Enterprise', yearsInPower: 1, photo: ph('Muhammad Yunus') }, famousLeader: { name: 'Sheikh Mujibur Rahman', era: '1971–1975', description: 'Father of Bangladesh, led independence', photo: ph('Sheikh Mujibur Rahman') } },
  { name: 'Ethiopia', slug: 'ethiopia', flag: 'et', capital: 'Addis Ababa', population: 126500000, region: 'Africa', subregion: 'East Africa', politicalSystem: 'Federal Parliamentary Republic', constitutionYear: 1994, nextElection: 'June 2026', democracyIndex: 3.27, headOfState: { name: 'Taye Atske Selassie', party: 'Non-partisan', position: 'President', age: 66, education: 'Addis Ababa University', ideology: 'Centrist', yearsInPower: 1, photo: ph('Taye Atske Selassie') }, headOfGovernment: { name: 'Abiy Ahmed', party: 'Prosperity Party', position: 'PM', age: 48, education: 'Addis Ababa University PhD', ideology: 'Pan-Ethiopianism', yearsInPower: 7, photo: ph('Abiy Ahmed') }, famousLeader: { name: 'Haile Selassie', era: '1930–1974', description: 'Last Emperor of Ethiopia, revered Rastafari figure', photo: ph('Haile Selassie') } },
  { name: 'Vietnam', slug: 'vietnam', flag: 'vn', capital: 'Hanoi', population: 99460000, region: 'Asia', subregion: 'Southeast Asia', politicalSystem: 'One-Party Socialist Republic', constitutionYear: 2013, nextElection: 'N/A (One-party state)', democracyIndex: 2.73, headOfState: { name: 'Lương Cường', party: 'CPV', position: 'President', age: 67, education: 'Military Academy', ideology: 'Marxism-Leninism', yearsInPower: 0, photo: ph('Luong Cuong') }, headOfGovernment: { name: 'Phạm Minh Chính', party: 'CPV', position: 'PM', age: 67, education: 'Academy of Politics', ideology: 'Marxism-Leninism', yearsInPower: 4, photo: ph('Pham Minh Chinh') }, famousLeader: { name: 'Hồ Chí Minh', era: '1945–1969', description: 'Father of modern Vietnam, independence leader', photo: ph('Hồ Chí Minh') } },
  { name: 'Malaysia', slug: 'malaysia', flag: 'my', capital: 'Kuala Lumpur', population: 33940000, region: 'Asia', subregion: 'Southeast Asia', politicalSystem: 'Federal Parliamentary Constitutional Monarchy', constitutionYear: 1957, nextElection: 'July 2028', democracyIndex: 7.30, headOfState: { name: 'Sultan Ibrahim', party: 'Non-partisan', position: 'Yang di-Pertuan Agong', age: 66, education: 'Royal Military Academy Sandhurst', ideology: 'Constitutional Monarch', yearsInPower: 1, photo: ph('Sultan Ibrahim') }, headOfGovernment: { name: 'Anwar Ibrahim', party: 'PKR', position: 'PM', age: 77, education: 'University of Malaya', ideology: 'Reformist', yearsInPower: 3, photo: ph('Anwar Ibrahim') }, famousLeader: { name: 'Mahathir Mohamad', era: '1981–2003, 2018–2020', description: 'Father of modern Malaysia', photo: ph('Mahathir Mohamad') } },
  { name: 'Singapore', slug: 'singapore', flag: 'sg', capital: 'Singapore', population: 5640000, region: 'Asia', subregion: 'Southeast Asia', politicalSystem: 'Parliamentary Republic', constitutionYear: 1965, nextElection: 'November 2025', democracyIndex: 6.02, headOfState: { name: 'Tharman Shanmugaratnam', party: 'Independent', position: 'President', age: 67, education: 'London School of Economics', ideology: 'Technocratic', yearsInPower: 2, photo: ph('Tharman Shanmugaratnam') }, headOfGovernment: { name: 'Lawrence Wong', party: 'PAP', position: 'PM', age: 51, education: 'Princeton, MIT', ideology: 'Pragmatic Centre', yearsInPower: 1, photo: ph('Lawrence Wong') }, famousLeader: { name: 'Lee Kuan Yew', era: '1959–1990', description: 'Founding father, transformed Singapore into a global hub', photo: ph('Lee Kuan Yew') } },
  { name: 'New Zealand', slug: 'new-zealand', flag: 'nz', capital: 'Wellington', population: 5124000, region: 'Oceania', subregion: 'Australia and NZ', politicalSystem: 'Parliamentary Constitutional Monarchy', constitutionYear: 1852, nextElection: 'October 2026', democracyIndex: 9.37, headOfState: { name: 'King Charles III', party: 'Non-partisan', position: 'Monarch', age: 77, education: 'Cambridge', ideology: 'Constitutional Monarch', yearsInPower: 3, photo: ph('King Charles III') }, headOfGovernment: { name: 'Christopher Luxon', party: 'National Party', position: 'PM', age: 54, education: 'University of Canterbury', ideology: 'Centre-Right', yearsInPower: 1, photo: ph('Christopher Luxon') }, famousLeader: { name: 'Richard Seddon', era: '1893–1906', description: 'Longest-serving PM, pioneered social reforms', photo: ph('Richard Seddon') } },
  { name: 'Sweden', slug: 'swSweden', flag: 'se', capital: 'Stockholm', population: 10550000, region: 'Europe', subregion: 'Northern Europe', politicalSystem: 'Parliamentary Constitutional Monarchy', constitutionYear: 1974, nextElection: 'September 2026', democracyIndex: 9.39, headOfState: { name: 'King Carl XVI Gustaf', party: 'Non-partisan', position: 'Monarch', age: 78, education: 'Royal Military Academy', ideology: 'Constitutional Monarch', yearsInPower: 52, photo: ph('Carl XVI Gustaf') }, headOfGovernment: { name: 'Ulf Kristersson', party: 'Moderate Party', position: 'PM', age: 60, education: 'Uppsala University', ideology: 'Centre-Right', yearsInPower: 3, photo: ph('Ulf Kristersson') }, famousLeader: { name: 'Olof Palme', era: '1969–1976, 1982–1986', description: 'Iconic Social Democrat leader, assassinated', photo: ph('Olof Palme') } },
  { name: 'Norway', slug: 'norway', flag: 'no', capital: 'Oslo', population: 5474000, region: 'Europe', subregion: 'Northern Europe', politicalSystem: 'Parliamentary Constitutional Monarchy', constitutionYear: 1814, nextElection: 'September 2025', democracyIndex: 9.81, headOfState: { name: 'King Harald V', party: 'Non-partisan', position: 'Monarch', age: 88, education: 'Norwegian Military Academy', ideology: 'Constitutional Monarch', yearsInPower: 34, photo: ph('King Harald V') }, headOfGovernment: { name: 'Jonas Gahr Støre', party: 'Labour Party', position: 'PM', age: 64, education: 'Sciences Po', ideology: 'Social Democracy', yearsInPower: 4, photo: ph('Jonas Gahr Store') }, famousLeader: { name: 'Gro Harlem Brundtland', era: '1981–1996', description: 'Three-time PM, pioneered sustainable development', photo: ph('Gro Harlem Brundtland') } },
  { name: 'Netherlands', slug: 'netherlands', flag: 'nl', capital: 'Amsterdam', population: 17530000, region: 'Europe', subregion: 'Western Europe', politicalSystem: 'Parliamentary Constitutional Monarchy', constitutionYear: 1815, nextElection: 'March 2028', democracyIndex: 9.00, headOfState: { name: 'King Willem-Alexander', party: 'Non-partisan', position: 'Monarch', age: 57, education: 'Leiden University', ideology: 'Constitutional Monarch', yearsInPower: 12, photo: ph('King Willem-Alexander') }, headOfGovernment: { name: 'Dick Schoof', party: 'Independent', position: 'PM', age: 67, education: 'Leiden University', ideology: 'Technocratic', yearsInPower: 1, photo: ph('Dick Schoof') }, famousLeader: { name: 'William of Orange', era: '16th century', description: 'Father of the Fatherland, led Dutch independence', photo: ph('William of Orange') } },
  { name: 'Switzerland', slug: 'switzerland', flag: 'ch', capital: 'Bern', population: 8810000, region: 'Europe', subregion: 'Western Europe', politicalSystem: 'Federal Semi-Direct Democracy', constitutionYear: 1848, nextElection: 'October 2027', democracyIndex: 9.14, headOfState: { name: 'Karin Keller-Sutter', party: 'FDP', position: 'President (rotating)', age: 61, education: 'University of Zurich', ideology: 'Liberal', yearsInPower: 1, photo: ph('Karin Keller-Sutter') }, headOfGovernment: null, famousLeader: { name: 'William Tell', era: 'Medieval', description: 'National folk hero symbolizing Swiss independence', photo: ph('William Tell') } },
];

// Fill defaults for condensed countries
const defaultTimeline: TimelineEvent[] = [{ year: 2024, title: 'Recent Political Activity', description: 'Ongoing political developments', type: 'event' }];
const defaultRising: RisingPolitician[] = [];

export const allCountries: CountryData[] = [
  ...countries,
  ...moreCountries.map(c => ({
    name: c.name!, slug: c.slug!, flag: c.flag!, capital: c.capital!,
    population: c.population!, region: c.region!, subregion: c.subregion!,
    politicalSystem: c.politicalSystem!, constitutionYear: c.constitutionYear!,
    nextElection: c.nextElection!, democracyIndex: c.democracyIndex!,
    headOfState: c.headOfState!,
    headOfGovernment: c.headOfGovernment || null,
    oppositionLeader: null,
    famousLeader: c.famousLeader!,
    risingPoliticians: c.risingPoliticians || defaultRising,
    timeline: defaultTimeline,
    aiScores: { influence: Math.floor(c.population! / 20000000) + 20, popularity: Math.floor(Math.random() * 40) + 40, stability: Math.floor(c.democracyIndex! * 10) },
    aiSummary: `${c.name} operates under a ${c.politicalSystem?.toLowerCase()} system. Current leadership focuses on national development and regional stability.`,
    economy: {
      gdp: `$${(c.population! * 0.00005).toFixed(1)} Trillion`,
      growth: '1.5%', inflation: '3.0%', unemployment: '5.5%', currency: 'Local Currency',
      summary: `The economy of ${c.name} is predominantly ${c.region === 'Europe' ? 'industrial' : 'developing'}, with a focus on ${c.region === 'Asia' ? 'technology and manufacturing' : 'natural resources and agriculture'}.`,
      indicators: [
        { label: 'Market Interest Rate', value: '4.5%', change: 'Stable', trend: 'stable' },
        { label: 'Trade Balance', value: 'Balanced', change: '0', trend: 'stable' }
      ],
      tradingViewSymbol: ({
        'australia': 'ASX:XJO',
        'canada': 'TSX',
        'south-korea': 'KOSPI',
        'mexico': 'BMV:IPC',
        'italy': 'MIL:FTSEMIB',
        'spain': 'BME:IBEX',
        'south-africa': 'JSE:J203',
        'turkey': 'BIST:XU100',
        'nigeria': '',
        'egypt': 'EGX:EGX30',
        'argentina': 'MERVAL',
        'indonesia': 'IDX:COMPOSITE',
        'saudi-arabia': 'TADAWUL:TASI',
        'pakistan': '',
        'ukraine': '',
        'israel': 'TASE:TA35',
        'poland': 'GPW:WIG20',
        'thailand': 'SET:SET',
        'iran': '',
        'philippines': '',
        'colombia': '',
        'kenya': '',
        'bangladesh': '',
        'ethiopia': '',
        'vietnam': 'HOSE:VNINDEX',
        'malaysia': 'MYX:FBMKLCI',
        'singapore': 'SGX:STI',
        'new-zealand': 'NZX:NZ50',
        'sweden': 'OMX:OMXS30',
        'norway': 'OSE:OBX',
        'netherlands': 'EURONEXT:AEX',
        'switzerland': 'SIX:SMI',
      } as Record<string, string>)[c.slug!] || ''
    }
  } as CountryData)),
];

export const regions = [...new Set(allCountries.map(c => c.region))].sort();
export const ideologies = [...new Set(allCountries.flatMap(c => [c.headOfState.ideology, c.headOfGovernment?.ideology].filter(Boolean)))].sort() as string[];

export function getCountryBySlug(slug: string): CountryData | undefined {
  return allCountries.find(c => c.slug === slug);
}

export function searchCountries(query: string, region?: string, minDemocracy?: number): CountryData[] {
  let results = allCountries;
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.headOfState.name.toLowerCase().includes(q) ||
      c.headOfGovernment?.name.toLowerCase().includes(q) ||
      c.capital.toLowerCase().includes(q)
    );
  }
  if (region) results = results.filter(c => c.region === region);
  if (minDemocracy) results = results.filter(c => c.democracyIndex >= minDemocracy);
  return results;
}
