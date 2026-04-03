/* eslint-disable */
const fs = require('fs');
const file = 'src/app/news/page.tsx';
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

const target1 = `    const [articles, setArticles] = useState<any[]>([]);
    const [polls, setPolls] = useState<any[]>([]);
    const [topics, setTopics] = useState<string[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(0);`;

const target2 = `    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/news/unified');
            const data = await res.json();
            if (data.articles) setArticles(data.articles);
            if (data.polls) setPolls(data.polls);
            if (data.topics) setTopics(data.topics);
            if (data.countries) setCountries(data.countries);
            if (data.stats) setStats(data.stats);
            setLastUpdated(data.lastUpdated || Date.now());
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, [fetchData]);`;

const rep1 = `    const articles = mockBreakingNews.map((n, i) => ({ ...n, id: \`gn-\${i}\`, title: n.headline, description: 'AI analysis suggests strong implications.', urgencyLevel: n.urgency, globalCategory: n.category?.toLowerCase() || 'politics', impactScore: 85, credibilityScore: 92, popularityScore: 12500, timeAgo: n.time, source: 'Reuters', url: '', sentiment: 'neutral', bias: 'center', topic: 'Policy', country: 'Global' }));
    const [polls, setPolls] = useState<any[]>(mockPolls || [
        { id: 'np1', question: 'Should the UN have binding authority over national climate policy?', options: [{ label: 'Yes, binding authority needed', votes: 42300 }, { label: 'Advisory role only', votes: 31200 }, { label: 'No UN involvement', votes: 18500 }, { label: 'Undecided', votes: 8900 }], totalVotes: 100900 },
        { id: 'np2', question: 'Which global issue deserves the most attention right now?', options: [{ label: 'Climate Change', votes: 38100 }, { label: 'Armed Conflicts', votes: 34800 }, { label: 'Economic Inequality', votes: 22600 }, { label: 'AI Regulation', votes: 19400 }, { label: 'Healthcare Access', votes: 15200 }], totalVotes: 130100 }
    ]);
    const topics = ['Policy', 'Economy', 'Global'];
    const countries = ['United States', 'Global'];
    const stats = { totalArticles: articles.length, breakingCount: articles.filter(n => n.urgencyLevel === 'high').length, avgCredibility: 90, sentimentBreakdown: { positive: 4, neutral: 6, negative: 2 }, topSources: ['Reuters', 'AP'] };
    const loading = false;
    const lastUpdated = Date.now();`;

const rep2 = `    // Static mode enabled`;

let success = true;
if (!content.includes(target1)) { console.log('Target 1 missing'); success = false; }
if (!content.includes(target2)) { console.log('Target 2 missing'); success = false; }

if (success) {
    content = content.replace(target1, rep1).replace(target2, rep2);
    fs.writeFileSync(file, content);
    console.log("Successfully patched news/page.tsx");
}
