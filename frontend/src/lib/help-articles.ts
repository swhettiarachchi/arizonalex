export interface HelpArticle {
    id: string;
    title: string;
    description: string;
    content: string; // The full article text
    categoryId: string;
    tag: string;
    tagColor: string;
    readTime: string;
    lastUpdated: string;
}

export const helpArticles: HelpArticle[] = [
    // --- GETTING STARTED ---
    {
        id: 'gs-1',
        title: 'Welcome to Arizonalex: Your Platform Tour',
        description: 'A complete overview of the primary hubs: News, Business, Politics, and Crypto.',
        categoryId: 'getting-started',
        tag: 'PLATFORM TOUR',
        tagColor: '#7C3AED',
        readTime: '6 min',
        lastUpdated: 'March 15, 2026',
        content: `Welcome to Arizonalex, the world's first integrated political and financial social intelligence platform.\n\nWhether you are a citizen tracking your representatives, a day trader monitoring macro-economic shifts, or a journalist analyzing sentiment, Arizonalex provides the tools you need in one unified ecosystem.\n\n### The Four Primary Hubs\nArizonalex is organized into four major hubs accessible from your left sidebar:\n\n1. **News Hub:** Your personalized feed of global and local headlines. We aggregate news from top-tier, verified journalistic organizations and apply our AI engine to provide unbiased summaries and detect potential partisan spin.\n2. **Business Hub:** Real-time market data across the S&P 500, NASDAQ, and international indices. You can link your external brokerage portfolio using Plaid to see your investments overlaid with major political events.\n3. **Politics Hub:** The core engine of Arizonalex. Here you can track active legislation natively pulled from congressional records, follow local representatives, view voting histories, and engage in high-level civic discourse.\n4. **Crypto Hub:** Live monitoring of digital assets, blockchain regulations, and the intersection of decentralized finance with evolving government crackdowns and approvals.\n\n### Your Profile & Identity\nYour Arizonalex profile is your digital civic identity. We encourage users to verify their accounts. Verified accounts (marked with blue, gold, or green badges) indicate that the user has securely proven their identity, professional affiliation, or elected office. To begin setting up your profile, click on your avatar in the bottom left corner and select 'Edit Profile'.\n\n### Next Steps\nWe recommend starting by finding your local representatives in the Politics Hub and clicking 'Follow'. Then, head to the Business Hub to set up a quick watchlist of your favorite assets. Welcome to the future of informed discourse!`
    },
    {
        id: 'gs-2',
        title: 'How to Customize Your Main Feed',
        description: 'Learn how our algorithm works and how to train it to show you what matters.',
        categoryId: 'getting-started',
        tag: 'FEED CUSTOMIZATION',
        tagColor: '#7C3AED',
        readTime: '4 min',
        lastUpdated: 'February 22, 2026',
        content: `Your main Home Feed is powered by a proprietary algorithmic engine designed not to trap you in an echo chamber, but to provide a balanced, high-fidelity stream of information across the political spectrum.\n\n### Training the Algorithm\nUnlike legacy social networks, the Arizonalex algorithm transparently responds to explicit user signals rather than just endless scrolling:\n\n* **Upvoting and Downvoting:** The arrows beneath a post directly impact its visibility. However, downvoting a post does NOT tell the algorithm "hide this perspective." It tells the algorithm "this specific post is low quality."\n* **Following:** Following verified journalists and politicians weighs their direct posts heavily in your feed.\n* **Topic Tags:** Every post is tagged with macro-topics (e.g., #Healthcare, #TechPolicy). By visiting Settings > Interests, you can manually boost or suppress entire categories of content.\n\n### The 'Perspective Balance' Slider\nExclusive to Arizonalex Premium is the Perspective Balance Slider found at the top right of your home feed. By default, it is set to 'Balanced', meaning the engine will actively surface well-reasoned posts from both classical progressive and classical conservative viewpoints regarding trending issues. \n\nIf you prefer to lock your feed to your own established network, simply slide the toggle to 'Following Only', which disables all algorithmic discovery and presents a strict reverse-chronological feed of the people you explicitly follow.\n\n### Muting and Blocking\nIf you wish to never see content from a specific user or containing a specific keyword (e.g., a TV show spoiler or a politician you are tired of hearing about), use the 'Mute Words' list in your Privacy Settings. Muting a user hides their posts from your feed without them knowing; blocking them prevents them from viewing your profile altogether.`
    },

    // --- ACCOUNT & PRIVACY ---
    {
        id: 'ap-1',
        title: 'Understanding Your Data Privacy Rights on Arizonalex',
        description: 'How we collect, use, and protect your personal data, and how you can control it.',
        categoryId: 'account-privacy',
        tag: 'PRIVACY',
        tagColor: '#3b82f6',
        readTime: '6 min',
        lastUpdated: 'March 18, 2026',
        content: `Arizonalex is fundamentally committed to democratic transparency and uncompromising user privacy. We believe that a civic platform must protect its citizens.\n\n### What We Do Not Do\nLet us start with what we never do: **We never sell your personal data to political campaigns, PACs, foreign entities, or third-party advertisers.** Your political leaning, voting history on internal polls, and portfolio holdings are mathematically anonymized before being used to calculate macro-sentiment on the platform.\n\n### How We Use Your Data\nThe data we collect (your interactions, read times, and watched tags) is used strictly to execute our core services:\n1. Powering the AI sentiment engines that summarize the 'mood' of the electorate.\n2. Personalizing your Home Feed and surfacing relevant legislation based on your state or district.\n3. Defending the platform against bot-nets and coordinated inauthentic behavior via anomaly detection.\n\n### Exporting Your Data\nYou have the sovereign right to access your data at any time. By visiting Settings > Privacy > Download My Data, you can initiate a full export of your account. This export is provided in a machine-readable JSON format and includes your complete post history, upvote log, saved portfolios, and direct message history. Please allow our servers up to 48 hours to compile and encrypt the archive before it is emailed to you.\n\n### Account Deletion\nIf you choose to leave Arizonalex, selecting 'Delete Account' from the Security menu initiates a 30-day grace period. During this time, your profile is hidden from public view. If you do not log back in within 30 days, your account and all associated personal data are permanently purged from our primary servers, retaining only anonymized algorithmic weights that cannot be reverse-engineered back to your identity.`
    },
    {
        id: 'ap-2',
        title: 'Setting Up Two-Factor Authentication (2FA)',
        description: 'Secure your verified profile or premium account from unauthorized access.',
        categoryId: 'account-privacy',
        tag: 'SECURITY',
        tagColor: '#3b82f6',
        readTime: '3 min',
        lastUpdated: 'January 10, 2026',
        content: `Given the sensitive nature of political discourse and the ability to link financial portfolios, securing your Arizonalex account with Two-Factor Authentication (2FA) is highly recommended. For Verified Accounts (Blue, Gold, or Green badges), **2FA is mandatory** to prevent platform manipulation via hijacked accounts.\n\n### How to Enable 2FA\n1. Click your avatar in the bottom left, then navigate to **Settings**.\n2. Select the **Security & Access** tab from the left menu.\n3. Scroll down to the 'Two-Factor Authentication' section and click **Set Up**.\n4. You will be prompted to enter your current password to verify your identity.\n\n### Supported Methods\nArizonalex supports two primary methods for 2FA:\n\n* **Authenticator App (Recommended):** Use apps like Google Authenticator, Authy, or 1Password. Scan the QR code displayed on your screen. This method is mathematically secure and not vulnerable to SIM-swapping attacks.\n* **SMS Verification:** You can link a mobile phone number to receive a 6-digit code via text message. While convenient, this is less secure than an authenticator app.\n\n### Backup Codes\nUpon successfully activating 2FA, the system will generate 10 backup codes. **Store these codes in a secure, offline location.** If you lose your phone or accidentally delete your authenticator app, these codes are the only way to regain access to your account without undergoing a manual, multi-week identity verification process with our support team.`
    },

    // --- POLITICS & LEGISLATION ---
    {
        id: 'pl-1',
        title: 'How to Track a Bill Through Congress Using Arizonalex',
        description: 'Step-by-step guide to finding, tracking, and understanding active legislation.',
        categoryId: 'politics-legislation',
        tag: 'LEGISLATION',
        tagColor: '#ef4444',
        readTime: '5 min',
        lastUpdated: 'March 05, 2026',
        content: `Tracking legislation empowers citizens to hold their elected officials accountable and allows investors to foresee regulatory shifts. Tracking legislation is one of the core features of Arizonalex, deeply integrated with the official Congressional API.\n\n### Finding a Bill\nTo begin tracking a bill, navigate to the **Politics Hub** from your main dashboard navigation. In the top search bar, you can type the explicit bill number (e.g., "HR 1", "S 450") or relevant keywords (e.g., "infrastructure", "crypto regulation").\n\nThe Search Results will display all relevant bills, complete with their sponsor, current status (Introduced, Passed House, Passed Senate, Signed), and the date of last action.\n\n### Activating Tracking Alerts\nOnce you click into a bill's detail page, click the prominent **Track this Bill** button located on the top right. By tracking the bill, you subscribe to real-time events:\n\n* You will receive push notifications whenever the bill is scheduled for a committee hearing.\n* You will receive timeline updates when amendments are proposed.\n* You will get an immediate alert when a floor vote occurs, along with a breakdown of how the vote split across party lines.\n\n### Understanding the AI Summaries\nCongressional bills are often hundreds of pages of obscure legal text. Arizonalex solves this by providing an **AI Bill Summary**. Our legal-language models automatically ingest the bill's text and provide a non-partisan, bulleted summary of the bill's actual effects. Furthermore, it predicts its potential economic impact across different market sectors, highlighting whether it aims to deregulate banking, increase tech penalties, or subsidize green energy.\n\nRemember, the AI summary is a tool to grant immediate context; we always provide a direct link to the raw, unedited legislative text hosted on government servers for verification.`
    },
    {
        id: 'pl-2',
        title: 'Using the Political Pulse Dashboard',
        description: 'Analyze nationwide sentiment, approval ratings, and election momentum in real-time.',
        categoryId: 'politics-legislation',
        tag: 'ANALYTICS',
        tagColor: '#ef4444',
        readTime: '4 min',
        lastUpdated: 'February 28, 2026',
        content: `The Political Pulse Dashboard is Arizonalex's premier tool for visualizing the macro-movements of the political landscape. It is updated every 5 minutes by aggregating millions of data points across the platform.\n\n### Accessing the Dashboard\nNavigate to the **Politics Hub** and select the **Pulse Analytics** tab. Here, you will see a command-center view of current civic engagement.\n\n### Key Metrics Explained\n* **Approval Tracking:** Instead of relying on monthly, slowly-published traditional polling, Arizonalex calculates a real-time 'aggregate approval' metric for prominent officials based on the sentiment of thousands of verified posts and news interactions regarding that official.\n* **Legislative Momentum:** This visualizes which bills are gaining traction. If a bill suddenly spikes in discussion volume across the platform—often correlating with a viral news cycle or a major committee move—it will appear in the 'High Momentum' quadrant, indicating it is likely to see floor action soon.\n* **Party Alignment Scores:** This tool analyzes congressional floor votes and compares them against historical party platforms, showing how often specific representatives vote against their party consensus.\n\n### Predictive Trend AI\nThe most powerful feature of the Pulse Dashboard is the Trend Predictor. By analyzing historical legislative outcomes and current social momentum, the AI provides a "Probability of Passage" percentage for major bills. While not a crystal ball, our models operate with an audited 84% accuracy rate on forecasting whether a bill will die in committee or make it to the President's desk.`
    },

    // --- MARKETS & FINANCE ---
    {
        id: 'mf-1',
        title: 'Setting Up Real-Time Market Alerts for S&P 500 Movements',
        description: 'Configure automated notifications for volatility, price targets, and political impacts.',
        categoryId: 'markets-finance',
        tag: 'MARKETS',
        tagColor: '#10b981',
        readTime: '4 min',
        lastUpdated: 'March 12, 2026',
        content: `Market alerts ensure you never miss a critical momentum shift, price movement, or sudden regulatory news that could impact your portfolio. Arizonalex integrates deeply with the Finnhub API to provide millisecond-accurate market data.\n\n### Configuring a Basic Alert\nGo to the **Business Hub** and select **My Watchlist**. On the top right of the watchlist table, click the **Add Alert** button (represented by a bell icon).\n\nYou can configure alerts based on several simple triggers:\n* **Price Targets:** Notify me when AAPL crosses above $180.\n* **Percentage Moves:** Notify me if the S&P 500 (SPY) drops more than 1.5% in a single trading session.\n* **Volume Spikes:** Notify me if a stock exceeds its 30-day average volume by 200%, indicating unusual institutional activity.\n\n### Advanced Political Synergy Alerts\nThe true power of Arizonalex lies in cross-referencing finance with politics. In the Alert creation modal, you can select 'Political Triggers'.\n\nFor example, you can set an alert that says: *Notify me whenever the Political Sentiment Tracker detects high-certainty legislative action regarding the 'Semiconductor' sector.* \n\nIf a bill heavily subsidizing domestic chip manufacturing suddenly passes a key committee vote, the Arizonalex engine will immediately alert you, often hours before traditional financial news networks run the breaking story.\n\n### Delivery Methods\nYou can choose to have alerts delivered via push notification on your mobile device, via Email, or as an In-App banner. For Arizonalex API / Enterprise users, you can configure Webhooks to trigger programmatic trading scripts on your own servers.`
    },
    {
        id: 'mf-2',
        title: 'Connecting Your Portfolio for Automated Financial Tracking',
        description: 'Securely link your brokerage to overlay your investments directly with political events.',
        categoryId: 'markets-finance',
        tag: 'PORTFOLIO',
        tagColor: '#10b981',
        readTime: '5 min',
        lastUpdated: 'March 20, 2026',
        content: `Instead of switching between your brokerage app and your news feed, Arizonalex allows you to securely overlay your actual investments against the global political landscape.\n\n### How Connection Works\nNavigate to the **Business Hub** and click **Link Portfolio**. We utilize **Plaid**, the industry standard for financial API security, to securely authenticate with over 10,000 global financial institutions including Fidelity, Charles Schwab, Robinhood, and Vanguard.\n\n**Important Security Note:** Arizonalex *never* stores, sees, or possesses your bank credentials. Plaid handles the login directly, and issues Arizonalex a secure, encrypted, 'read-only' token. This means Arizonalex can only view your holdings; it is impossible for our system to execute trades or move money on your behalf.\n\n### The Overlay Experience\nOnce your portfolio is linked and synced, the Business Hub transforms. Your specific holdings will be mapped against incoming news.\n\nIf you hold heavy positions in pharmaceutical companies, the Arizonalex AI will automatically prioritize news regarding FDA regulations, healthcare subsidy bills in Congress, and pertinent statements by the Health Committee chair in your feed.\n\nWhen viewing a specific stock's chart, you will see 'Event Nodes' plotted directly onto the graph—showing exactly when a major political speech was made, or a bill was passed, and how the stock price reacted in the immediate aftermath. This provides unprecedented historical clarity on how policy affects your wealth.`
    },

    // --- AI TOOLS ---
    {
        id: 'ai-1',
        title: 'Using AI Sentiment Analysis for Political Trend Predictions',
        description: 'A deep dive into how Arizonalex calculates the "mood" of the internet.',
        categoryId: 'ai-tools',
        tag: 'AI TOOLS',
        tagColor: '#f59e0b',
        readTime: '7 min',
        lastUpdated: 'February 10, 2026',
        content: `Our proprietary AI sentiment engine is the technological core of the Arizonalex platform. It scans millions of news articles, congressional transcripts, validated social posts, and market movements per minute to calculate the unvarnished reality of political trends.\n\n### How the Dial Works\nWhen viewing any trending topic on the Explore page, or viewing a specific politician's profile, look for the 'AI Sentiment' dial widget. It operates on a continuous scale from -100 (Extremely Negative) to 0 (Neutral) to +100 (Extremely Positive).\n\nThis is not a simple keyword-matching script. It utilizes advanced Large Language Models to contextualize sarcasm, nuanced arguments, and complex legislative jargon. \n\n### The Two Dimensions of Sentiment\nThe AI provides two distinct vectors for every topic:\n1. **Current Mood:** The aggregated emotional intent of the discourse surrounding the topic over the last 2 hours. \n2. **Momentum (Trend velocity):** Is the topic growing or dying? A topic might have a Neutral mood, but a rapidly accelerating momentum curve, indicating a breaking news story that is about to explode.\n\n### The Impact Score\nArizonalex generates an 'Impact Score' for major political events. When a specific bill is introduced or a macroeconomic data point (like CPI) is printed, the AI cross-references the event against 25 years of historical market data and political reactions.\n\nIt then predicts, with an assigned confidence interval, how likely the event is to influence specific sector ETFs (e.g., 'Health Care Select Sector SPDR'). Users must remember that these are probabilistic assessments, not financial certainties.`
    },

    // --- COMMUNITY GUIDELINES ---
    {
        id: 'cg-1',
        title: 'How to Report Misinformation and Political Disinformation',
        description: 'The protocols for maintaining a high-fidelity information ecosystem.',
        categoryId: 'community',
        tag: 'MODERATION',
        tagColor: '#06b6d4',
        readTime: '3 min',
        lastUpdated: 'March 01, 2026',
        content: `Maintaining a high-quality civic discourse is our top priority. We rely on the community, augmented by AI, to quickly identify and suppress deliberate disinformation campaigns, deepfakes, and bad actors.\n\n### Filing a Report\nIf you encounter blatant falsehoods, unlabelled synthetic media (AI-generated fakes), or targeted harassment, please report it immediately: \n\n1. Click the three dots ('...') located on the top right of any post, comment, or article.\n2. Select **Report** from the dropdown menu.\n3. A modal will appear. Choose the specific category: 'Misinformation', 'Harassment', or 'Spam'.\n4. Provide a brief sentence or link verifying why the content is false. This exponentially speeds up the review process.\n\n### The Moderation Process\nOnce reported, the post enters our triage system. If a post receives a sudden spike in reports, our AI automatically restricts its virality while pushing it to the top of the queue for human review. \n\nOur human moderation team, assisted by automated fact-checking flags from recognized journalistic entities (like Reuters and the Associated Press), will review the report within 24 hours. \n\n### Consequences for Bad Actors\nAccounts found repeatedly posting disinformation will face progressive platform restrictions through our Strike System. Upon reaching three strikes for intentional misinformation, the account will be permanently banned, and their verification credentials revoked globally.`
    },

    // --- TECHNICAL ISSUES ---
    {
        id: 'ti-1',
        title: 'Troubleshooting Real-Time Data Websocket Disconnects',
        description: 'Fixing issues where market prices or live chat stops updating automatically.',
        categoryId: 'technical',
        tag: 'TROUBLESHOOTING',
        tagColor: '#8b5cf6',
        readTime: '4 min',
        lastUpdated: 'March 22, 2026',
        content: `Arizonalex relies heavily on WebSocket connections to stream real-time market data, live notifications, and instantaneous messaging. If you notice that stock prices have stopped flashing, or you are not receiving new messages until you refresh the page, your connection has likely degraded.\n\n### Common Causes\n1. **Network Fluctuations:** Switching between Wi-Fi and Cellular data, or using a highly restrictive corporate VPN, can sever the persistent WebSocket connection to our servers.\n2. **Aggressive Browser Extensions:** Ad-blockers, tracking-blockers (like PrivacyBadger or uBlock Origin), and strict firewall settings sometimes misidentify our financial data streams as tracking scripts and purposefully block them.\n3. **Background Tab Throttling:** Modern browsers (Chrome, Edge, Safari) aggressively 'sleep' tabs that are out of focus to save battery. When you return to the tab, the connection may have timed out.\n\n### How to Fix the Issue\nIf you experience a freeze, simply clicking the **Refresh / Reconnect** icon (the circular arrow) on the System Status bar at the top of the page will force the client to establish a fresh WebSocket pipeline. \n\nIf the issue persists consistently:\n* Disable your ad-blocker specifically for the \`arizonalex.com\` domain.\n* Check our [System Status](/status) page to ensure we are not experiencing an active outage with our data providers (like Finnhub or Congress.gov).\n* Clear your browser cache and cookies, forcing a fresh session token generation.`
    },

    // --- BILLING & SUBSCRIPTIONS ---
    {
        id: 'bs-1',
        title: 'Understanding Arizonalex Subscription Tiers',
        description: 'A breakdown of Free, Pro, and Enterprise functionality.',
        categoryId: 'billing',
        tag: 'PLANS',
        tagColor: '#ec4899',
        readTime: '5 min',
        lastUpdated: 'January 05, 2026',
        content: `Arizonalex is dedicated to keeping basic civic information free for all citizens, while offering advanced analytics tools for professionals, traders, and organizations.\n\n### The Free Tier\nThe standard Arizonalex account is completely free. It includes:\n* Access to the News, Politics, and Business hubs.\n* The ability to follow representatives and vote in community polls.\n* Basic bill tracking (up to 5 active bills at once).\n* Delayed market data (15-minute delay on equities).\n* 5 basic threshold market alerts.\n\n### Arizonalex Pro ($9.99/mo)\nDesigned for active civic participants and independent investors, the Pro tier unlocks:\n* **Real-time, zero-delay Level 1 market data** across all hubs.\n* Unlimited bill tracking and advanced legislative momentum analytics.\n* Unlimited access to the AI Sentiment Dial and Policy Impact Predictor tools.\n* The 'Perspective Balance' slider to fully customize your algorithm.\n* Unlimited Watchlist alerts via SMS and Email.\n\n### Arizonalex Enterprise (Custom Pricing)\nBuilt for news organizations, hedge funds, and political campaigns:\n* Full REST API and WebSocket access to our data firehose, allowing you to ingest our political sentiment calculations into your own internal trading algorithms.\n* The ability to export millions of rows of historical sentiment data in JSON/CSV formats.\n* Sub-account management for teams of analysts.\n* Dedicated 24/7 account management and priority infrastructure routing.\n\nTo upgrade or manage your subscription, visit Settings > Billing & Subscriptions. All payments are securely processed by Stripe. You can cancel at any time, and your Pro features will remain active until the end of the current billing cycle.`
    },

    // --- ADVANCED: VERIFICATION ---
    {
        id: 'gs-3',
        title: 'Complete Guide to Getting Verified on Arizonalex',
        description: 'Everything you need to know about applying for Blue, Gold, or Green verification badges.',
        categoryId: 'getting-started',
        tag: 'VERIFICATION',
        tagColor: '#7C3AED',
        readTime: '8 min',
        lastUpdated: 'March 22, 2026',
        content: `Verification on Arizonalex signals authenticity, trust, and accountability. Our multi-tier badge system is designed to protect the integrity of civic discourse and financial discussion.\\n\\n### Understanding the Three Badge Tiers\\nArizonalex uses a color-coded verification system, each representing a different domain of credibility:\\n\\n* **Blue Badge — Government & Officials:** Reserved for elected representatives, government agencies, political candidates, and diplomats. Applicants must provide government-issued credentials and proof of office or candidacy.\\n* **Gold Badge — Media & Journalism:** Awarded to credentialed journalists, news organizations, and recognized media professionals. Requires press credentials, byline history from recognized publications, or organizational affiliation documentation.\\n* **Green Badge — Finance & Analysis:** Designed for certified financial analysts, licensed advisors (CFA, Series 7/66), established economists, and recognized fintech professionals. Requires professional license documentation or verifiable institutional affiliation.\\n\\n### Eligibility Requirements\\nTo qualify for verification, your account must meet these baseline criteria:\\n1. **Complete Profile:** A fully filled-out profile including bio, professional title, and a recognizable profile photo.\\n2. **Active History:** At least 30 days of active account usage with meaningful engagement (posts, comments, or shared analyses).\\n3. **Authentic Identity:** A government-issued photo ID matching the name on the account.\\n4. **Notability Evidence:** At least 2 independent, verifiable links demonstrating your public presence — news mentions, official websites, Wikipedia pages, or institutional directory listings.\\n5. **Clean Record:** No active strikes or history of misinformation violations on the platform.\\n\\n### The Application Process\\nThe verification flow is a 3-step guided wizard accessible at /verify:\\n1. **Select Category:** Choose whether you are applying as a Government Official, Journalist, Business/Brand, or Creator.\\n2. **Identity Verification:** Upload your legal name and a government-issued document. For organizations, upload Articles of Incorporation or an official letterhead.\\n3. **Notability Proof:** Provide URLs to external sources confirming your public presence and a brief statement explaining why your account warrants verification.\\n\\n### Review Timeline & Outcomes\\nOur Trust & Safety team reviews all applications within 3-5 business days. You will receive an in-app notification with the result. If denied, you will receive specific feedback and may reapply after 90 days. Verified accounts that violate platform guidelines may have their badges revoked.\\n\\n### Benefits of Verification\\nVerified accounts enjoy several advantages:\\n* A colored badge displayed next to your name across all posts, comments, and profiles.\\n* Priority placement in search results and recommendation algorithms.\\n* Access to the Verified Creator Studio with advanced analytics.\\n* Mandatory 2FA enforcement for enhanced account protection.\\n* Priority customer support with dedicated response lanes.`
    },

    // --- ADVANCED: MOBILE OPTIMIZATION ---
    {
        id: 'gs-4',
        title: 'Optimizing Your Arizonalex Experience on Mobile',
        description: 'Tips and tricks for the best mobile experience across iOS and Android browsers.',
        categoryId: 'getting-started',
        tag: 'MOBILE',
        tagColor: '#7C3AED',
        readTime: '5 min',
        lastUpdated: 'March 20, 2026',
        content: `Arizonalex is designed as a responsive Progressive Web App (PWA), meaning you get a near-native experience directly in your mobile browser without downloading anything from an app store.\\n\\n### Installing Arizonalex as a PWA\\nFor the best mobile experience, we recommend installing Arizonalex to your home screen:\\n\\n**On iOS (Safari):**\\n1. Navigate to arizonalex.com in Safari.\\n2. Tap the Share button (the square with an arrow).\\n3. Scroll down and tap "Add to Home Screen."\\n4. Name it "Arizonalex" and tap Add.\\n\\n**On Android (Chrome):**\\n1. Navigate to arizonalex.com in Chrome.\\n2. Tap the three-dot menu in the top right.\\n3. Select "Add to Home Screen" or "Install App."\\n4. Confirm the installation.\\n\\nOnce installed, Arizonalex opens in its own window without browser chrome, supports push notifications, and caches key assets for faster load times.\\n\\n### Mobile-Specific Features\\n* **Swipe Navigation:** Swipe left or right on the main feed to quickly switch between News, Politics, Business, and Crypto hubs.\\n* **Compact Mode:** In Settings > Display, toggle "Compact Cards" to see more posts per screen on smaller devices.\\n* **Offline Reading:** Articles and bill summaries you have viewed are cached locally. You can read them offline for up to 7 days.\\n* **Biometric Login:** On supported devices, enable Face ID or fingerprint authentication for instant, secure access.\\n\\n### Reducing Data Usage\\nIf you are on a limited data plan, navigate to Settings > Data & Storage:\\n* Disable "Auto-play Video Previews" to prevent media from loading automatically.\\n* Enable "Data Saver Mode" to reduce image quality and defer non-essential API requests.\\n* Turn off real-time WebSocket streaming and switch to manual refresh for market data.\\n\\n### Notification Management\\nMobile push notifications are controlled separately from in-app notifications. Visit Settings > Notifications > Push to configure which events trigger mobile alerts — we recommend enabling alerts for tracked bills, portfolio price targets, and direct messages.`
    },

    // --- ADVANCED: API STRATEGIES ---
    {
        id: 'ti-2',
        title: 'API Rate Limiting Strategies and Best Practices',
        description: 'Maximize your API throughput and handle rate limits gracefully in production.',
        categoryId: 'technical',
        tag: 'API',
        tagColor: '#8b5cf6',
        readTime: '7 min',
        lastUpdated: 'March 18, 2026',
        content: `The Arizonalex API enforces rate limits to ensure platform stability and fair access for all users. Understanding these limits and designing around them is essential for building robust integrations.\\n\\n### Rate Limit Tiers\\nRate limits are applied per API key and vary by subscription:\\n* **Pro:** 1,000 requests per hour, with a burst allowance of 50 requests per second.\\n* **Enterprise:** 50,000 requests per hour, with a burst allowance of 500 requests per second.\\n* **WebSocket Streams:** No per-message rate limit on subscribed channels, but connection limits apply (Pro: 5 concurrent, Enterprise: 100 concurrent).\\n\\n### Reading Rate Limit Headers\\nEvery API response includes rate limit information in the HTTP headers:\\n* \`X-RateLimit-Limit\`: Your total allowed requests per window.\\n* \`X-RateLimit-Remaining\`: Requests remaining in the current window.\\n* \`X-RateLimit-Reset\`: Unix timestamp of when the window resets.\\n* \`Retry-After\`: Present only on 429 responses — seconds to wait before retrying.\\n\\n### Exponential Backoff Strategy\\nWhen you receive a 429 (Too Many Requests) response, implement exponential backoff:\\n1. Wait the \`Retry-After\` duration, or use a base delay of 1 second.\\n2. On consecutive failures, double the delay: 1s, 2s, 4s, 8s, up to a maximum of 60 seconds.\\n3. Add jitter (random milliseconds) to prevent thundering herd issues when multiple clients retry simultaneously.\\n\\n### Caching Best Practices\\nReduce API calls by caching responses intelligently:\\n* **Bill Data:** Cache for 15 minutes — legislative data updates infrequently.\\n* **Sentiment Scores:** Cache for 5 minutes — recalculated frequently but not real-time.\\n* **Market Data:** Use WebSocket streams instead of polling endpoints.\\n* **User Profiles:** Cache for 1 hour with stale-while-revalidate pattern.\\n\\n### Batching Requests\\nThe API supports batch endpoints for common operations:\\n* \`POST /api/v2/bills/batch\` — Fetch up to 50 bills in a single request.\\n* \`POST /api/v2/sentiment/batch\` — Get sentiment scores for up to 20 topics simultaneously.\\n* \`POST /api/v2/market/batch\` — Retrieve quotes for up to 100 tickers at once.\\n\\nBatching dramatically reduces your request count and is the single most impactful optimization for most integrations.`
    },

    // --- ADVANCED: PORTFOLIO SECURITY ---
    {
        id: 'ap-3',
        title: 'Hardening Your Financial Portfolio Connection Security',
        description: 'Advanced security practices for users who connect brokerage accounts via Plaid.',
        categoryId: 'account-privacy',
        tag: 'SECURITY',
        tagColor: '#3b82f6',
        readTime: '6 min',
        lastUpdated: 'March 15, 2026',
        content: `Connecting your brokerage portfolio to Arizonalex unlocks powerful political-financial correlation tools. This guide covers the security architecture and best practices for protecting your linked financial data.\\n\\n### How Plaid Integration Works\\nArizonalex uses Plaid — the industry-standard financial data aggregation layer trusted by thousands of fintech applications — to connect to your brokerage.\\n\\n**Key Security Properties:**\\n* Arizonalex never receives or stores your brokerage username or password. Plaid handles authentication directly.\\n* The token issued to Arizonalex is strictly read-only. It is cryptographically impossible for our system to execute trades or move money.\\n* All data in transit is encrypted with TLS 1.3. All data at rest is encrypted with AES-256.\\n* Portfolio data is cached in-memory for performance and purged from our servers within 24 hours. It is never written to permanent storage.\\n\\n### Recommended Security Configuration\\n1. **Enable 2FA on Both Platforms:** Ensure two-factor authentication is enabled on both your Arizonalex account AND your brokerage account.\\n2. **Use an Authenticator App:** SMS-based 2FA is vulnerable to SIM-swapping. Use Google Authenticator, Authy, or a hardware key like YubiKey.\\n3. **Review Connected Apps:** Periodically visit your brokerage account settings to review which third-party apps have access. Revoke any you no longer use.\\n4. **Monitor Plaid Access Logs:** Arizonalex displays your last sync time in Business Hub > Portfolio > Connection Status. If you see unexpected sync times, investigate immediately.\\n\\n### Disconnecting Your Portfolio\\nTo immediately revoke Arizonalex access to your portfolio data:\\n1. Navigate to Business Hub > Portfolio > Connection Settings.\\n2. Click "Disconnect Portfolio."\\n3. Confirm the action. The Plaid access token is immediately invalidated.\\n4. All cached portfolio data is purged within 60 seconds.\\n\\nFor additional peace of mind, you can also revoke access directly from your brokerage account settings, which invalidates the token from the source.\\n\\n### Incident Response\\nIf you suspect unauthorized access to your financial data, immediately:\\n1. Disconnect your portfolio (steps above).\\n2. Change your passwords on both Arizonalex and your brokerage.\\n3. Contact our security team at security@arizonalex.com — we have a dedicated financial incident response protocol.\\n4. Check your brokerage account for any unauthorized transactions and contact your broker directly.`
    },

    // --- ADVANCED: AI TRANSPARENCY ---
    {
        id: 'ai-2',
        title: 'Understanding AI Model Transparency and Bias Controls',
        description: 'How Arizonalex ensures AI political analysis remains unbiased and auditable.',
        categoryId: 'ai-tools',
        tag: 'AI ETHICS',
        tagColor: '#f59e0b',
        readTime: '8 min',
        lastUpdated: 'March 10, 2026',
        content: `As a platform that applies artificial intelligence to political discourse, Arizonalex bears a significant responsibility to ensure our AI systems remain transparent, unbiased, and auditable. This article explains our methodology.\\n\\n### The Bias Detection Pipeline\\nEvery AI model deployed on Arizonalex goes through a rigorous bias detection pipeline before and after deployment:\\n\\n1. **Training Data Audit:** Our training datasets are sourced from a curated mix of left-leaning, right-leaning, and centrist publications, weighted to reflect the actual media ecosystem. We publish the source distribution annually.\\n2. **Adversarial Testing:** Before deployment, each model is subjected to adversarial prompts designed to elicit biased outputs. If the model exhibits measurable partisan skew (>5% deviation on our Political Lean Index), it is retrained.\\n3. **Continuous Monitoring:** Post-deployment, we run automated bias audits every 24 hours, comparing sentiment scores across politically equivalent topics from opposing perspectives.\\n4. **External Audits:** We commission quarterly third-party audits from independent AI ethics organizations. Results are published in our Transparency Reports.\\n\\n### How Sentiment Scores Are Calculated\\nThe AI Sentiment Dial you see on trending topics uses a multi-model ensemble approach:\\n* **Model A (Linguistic):** Analyzes the semantic content and emotional tone of text.\\n* **Model B (Contextual):** Cross-references claims against a database of verified facts and established positions.\\n* **Model C (Temporal):** Weights recent events more heavily and adjusts for news cycle dynamics.\\n\\nThe final score is a weighted average of all three models, with confidence intervals displayed alongside every score. A low confidence interval means the models disagree — indicating a genuinely nuanced topic.\\n\\n### User Controls\\nYou have full control over how AI appears in your experience:\\n* **Disable AI Summaries:** Settings > AI > Toggle off "AI Bill Summaries" to see only raw legislative text.\\n* **Hide Sentiment Dials:** Settings > AI > Toggle off "Sentiment Indicators" to remove AI analysis from topic pages.\\n* **Opt Out of AI Training:** Settings > Privacy > AI Data Usage > "Do not use my interactions to improve AI models."\\n\\n### Our Commitments\\n1. We will never use AI to suppress or promote content based on political orientation.\\n2. All AI-generated content is clearly labeled with a distinctive marker.\\n3. We publish model cards for every production model documenting training methodology, known limitations, and performance benchmarks.\\n4. Users can always access the original source material that the AI analyzed.`
    },

    // --- ADVANCED: ELECTION TOOLS ---
    {
        id: 'pl-3',
        title: 'Using Arizonalex Election Coverage Tools',
        description: 'Master the real-time election night dashboard, candidate comparison, and results tracker.',
        categoryId: 'politics-legislation',
        tag: 'ELECTIONS',
        tagColor: '#ef4444',
        readTime: '6 min',
        lastUpdated: 'March 08, 2026',
        content: `During election season, Arizonalex transforms into a comprehensive election command center with real-time vote counting, candidate analysis, and predictive modeling.\\n\\n### The Election Night Dashboard\\nAccessible under Politics Hub > Elections, the dashboard provides:\\n* **Live Vote Count Map:** An interactive map updated every 30 seconds with county-level vote reporting data sourced directly from state election boards.\\n* **Race Calls:** Our AI models project winners based on statistical analysis of reported precincts, historical voting patterns, and outstanding ballot estimates. We clearly distinguish between "projected" and "certified" results.\\n* **Social Pulse Meter:** A real-time visualization of social media sentiment for each major candidate, segmented by platform and demographic.\\n\\n### Candidate Comparison Tool\\nBefore elections, the Candidate Comparison tool allows you to select 2-4 candidates and view side-by-side analysis of:\\n* **Voting Record:** Complete legislative voting history with party alignment scores.\\n* **Policy Positions:** AI-extracted position summaries from public statements, interviews, and campaign materials.\\n* **Donor Analysis:** Campaign finance data pulled from FEC filings, showing top donors, small-dollar percentage, and total fundraising.\\n* **AI Bias Check:** An impartiality score for each candidate page, ensuring neither is presented more favorably.\\n\\n### Setting Up Election Alerts\\nTo track specific races:\\n1. Navigate to Politics Hub > Elections > Track Races.\\n2. Select the races you want to follow (Presidential, Senate, House, Governor, or local).\\n3. Configure alert sensitivity: "Major Events Only" or "Every Update."\\n4. Choose delivery method: push notification, email, or SMS.\\n\\nOn election night, you will receive real-time alerts as vote thresholds are crossed and as major outlets project winners.\\n\\n### Historical Election Data\\nAll past election data back to 2010 is available in the Elections Archive, including county-level results, turnout statistics, and demographic breakdowns. This data is fully accessible through the API for Pro and Enterprise users running their own analyses.`
    },

    // --- ADVANCED: ACCESSIBILITY ---
    {
        id: 'gs-5',
        title: 'Accessibility Features and Assistive Technology Support',
        description: 'How to customize Arizonalex for screen readers, keyboard navigation, and visual preferences.',
        categoryId: 'getting-started',
        tag: 'ACCESSIBILITY',
        tagColor: '#7C3AED',
        readTime: '4 min',
        lastUpdated: 'March 05, 2026',
        content: `Arizonalex is committed to making civic engagement accessible to every citizen, regardless of ability. Our platform is designed to meet WCAG 2.1 AA standards.\\n\\n### Screen Reader Support\\nArizonalex is fully compatible with major screen readers including JAWS, NVDA, VoiceOver (macOS/iOS), and TalkBack (Android). All interactive elements have proper ARIA labels, and our page structure uses semantic HTML so screen readers can navigate by landmarks, headings, and regions.\\n\\n### Keyboard Navigation\\nEvery feature on Arizonalex is accessible via keyboard:\\n* **Tab / Shift+Tab:** Navigate between interactive elements.\\n* **Enter / Space:** Activate buttons, links, and expand accordions.\\n* **Arrow Keys:** Navigate within menus, dropdowns, and data tables.\\n* **Escape:** Close modals, dropdowns, and overlays.\\n* **Skip Links:** Press Tab on any page to reveal "Skip to Main Content" link.\\n\\n### Visual Customization\\nNavigate to Settings > Display > Accessibility to configure:\\n* **High Contrast Mode:** Increases contrast ratios across all UI elements, meeting WCAG AAA standards.\\n* **Reduced Motion:** Disables all animations and transitions for users with vestibular disorders.\\n* **Font Size:** Scale platform text from 80% to 200% without layout breakage.\\n* **Color Blind Modes:** Protanopia, Deuteranopia, and Tritanopia filters that adjust chart colors and status indicators.\\n\\n### Data Visualization Accessibility\\nAll charts and graphs include:\\n* Text descriptions readable by screen readers.\\n* Data table alternatives for every chart.\\n* Pattern fills (not just color) to distinguish data series.\\n* Keyboard-navigable data points with spoken values.\\n\\n### Reporting Accessibility Issues\\nIf you encounter any accessibility barrier, please email accessibility@arizonalex.com or file a report at /report with the category "Accessibility." Our team triages these reports within 48 hours.`
    },

    // --- ADVANCED: DATA EXPORT ---
    {
        id: 'ap-4',
        title: 'Complete Guide to Data Export and Portability',
        description: 'Export your posts, analytics, watchlists, and legislative tracking data in multiple formats.',
        categoryId: 'account-privacy',
        tag: 'DATA EXPORT',
        tagColor: '#3b82f6',
        readTime: '5 min',
        lastUpdated: 'March 01, 2026',
        content: `Arizonalex believes your data belongs to you. We provide comprehensive export tools that let you download everything — from your post history to your AI analysis logs — in machine-readable formats.\\n\\n### Requesting a Full Export\\n1. Navigate to **Settings > Privacy > Download My Data**.\\n2. Select the data categories you want to include (or check "Select All").\\n3. Choose your preferred format: **JSON** (structured data), **CSV** (spreadsheets), or **Both**.\\n4. Click **Request Export**. Our servers will compile your archive within 48 hours.\\n5. You will receive an email with a secure download link valid for 7 days.\\n\\n### What Is Included\\nA full export contains:\\n* **Profile Data:** Name, bio, settings, preferences, and avatar.\\n* **Posts & Comments:** Every post and comment you have ever made, with timestamps and engagement metrics.\\n* **Legislative Tracking:** All bills you have followed, their status at the time of export, and your interaction history.\\n* **Market Watchlists:** Your watchlist configurations, alert rules, and historical alert triggers.\\n* **AI Interaction Logs:** Every AI query you have made, including sentiment analysis requests and their results.\\n* **Direct Messages:** Complete message history with timestamps and read receipts.\\n* **Poll Votes:** Your voting history on community polls.\\n\\n### Selective Exports\\nYou do not need to export everything. In the export settings, you can select specific categories and specific date ranges. For example, export only "Posts & Comments" from "January 2026 to March 2026."\\n\\n### API-Based Exports\\nPro and Enterprise users can programmatically export data via the API:\\n* \`GET /api/v2/me/export?format=json&categories=posts,watchlists\`\\n* Large exports are delivered asynchronously via webhook callback.\\n\\n### Data Portability\\nYour exported data is designed to be portable. The JSON schema is documented at docs.arizonalex.com/schema, allowing you to import your data into other platforms, personal databases, or analysis tools.`
    },

    // --- ADVANCED: WEBSOCKET PERFORMANCE ---
    {
        id: 'ti-3',
        title: 'Advanced WebSocket Performance Tuning Guide',
        description: 'Optimize real-time data streaming for market feeds, notifications, and live political events.',
        categoryId: 'technical',
        tag: 'PERFORMANCE',
        tagColor: '#8b5cf6',
        readTime: '6 min',
        lastUpdated: 'February 25, 2026',
        content: `Arizonalex uses WebSocket connections extensively for real-time features: market price streaming, live notifications, instant messaging, and political event alerts. This guide covers advanced tuning for optimal performance.\\n\\n### Connection Architecture\\nThe Arizonalex WebSocket infrastructure uses a distributed gateway model:\\n* **Primary Gateway:** \`wss://stream.arizonalex.com\` — Auto-routes to the nearest regional node.\\n* **Fallback:** If WebSocket fails (e.g., due to a restrictive proxy), the client automatically downgrades to Server-Sent Events (SSE), then to long-polling as a last resort.\\n* **Heartbeat:** The server sends a ping frame every 30 seconds. If no pong is received within 10 seconds, the connection is considered dead and auto-reconnects.\\n\\n### Subscription Channels\\nWhen you connect, subscribe only to the channels you need to minimize bandwidth:\\n* \`market:{ticker}\` — Real-time price updates for a specific stock or crypto.\\n* \`notifications\` — Personal notifications (mentions, replies, alerts).\\n* \`politics:live\` — Breaking political events and vote results.\\n* \`bills:{bill_id}\` — Status updates for a specific tracked bill.\\n\\nEach additional subscription adds approximately 50-200 bytes/second of bandwidth depending on activity.\\n\\n### Optimization Strategies\\n1. **Throttle UI Updates:** If you are displaying real-time prices, batch incoming WebSocket messages and update the DOM at most 4 times per second using \`requestAnimationFrame\`. This prevents rendering bottlenecks.\\n2. **Selective Reconnection:** On disconnect, only resubscribe to active channels. Do not replay the full subscription list if the user has navigated away from certain hubs.\\n3. **Compression:** Our WebSocket gateway supports \`permessage-deflate\`. Ensure your client library has compression enabled — this reduces bandwidth by 60-80% for text-heavy political event streams.\\n4. **Connection Pooling:** For Enterprise integrations running multiple analysis scripts, use a single WebSocket connection with multiplexed channels rather than opening separate connections per data stream.\\n\\n### Debugging Connection Issues\\nOpen your browser DevTools > Network > WS to inspect the WebSocket connection:\\n* Green frames = incoming data (server to client).\\n* Red frames = outgoing data (client to server).\\n* If you see frequent close/reopen patterns, check for ad-blockers or VPN interference.\\n\\nYou can also visit /status to check if our WebSocket infrastructure is experiencing any degradation.`
    },

    // --- ADVANCED: CUSTOM ALERTS ---
    {
        id: 'mf-3',
        title: 'Building Custom Alert Scripts with the Arizonalex API',
        description: 'Create sophisticated multi-condition alerts combining market data with political triggers.',
        categoryId: 'markets-finance',
        tag: 'AUTOMATION',
        tagColor: '#10b981',
        readTime: '7 min',
        lastUpdated: 'February 20, 2026',
        content: `While the Arizonalex UI supports basic price and sentiment alerts, power users can create sophisticated multi-condition alert scripts using the API and WebSocket feeds. This guide walks through common automation patterns.\\n\\n### Prerequisites\\n* An Arizonalex Pro or Enterprise account with API access.\\n* An API key generated from Settings > Developer > API Keys.\\n* A server or cloud function environment (AWS Lambda, Google Cloud Functions, or a local script).\\n\\n### Pattern 1: Political Event + Market Trigger\\nThis alert fires when a specific sector experiences unusual volume AND a related bill moves in Congress simultaneously:\\n1. Subscribe to the WebSocket channel \`politics:bills\` to receive real-time bill status updates.\\n2. Use the REST API to poll \`/api/v2/market/sector/{sector}/volume\` every 5 minutes.\\n3. When both conditions are met within a 15-minute window, fire a webhook to your notification service.\\n\\n### Pattern 2: Sentiment Threshold Alert\\nMonitor the AI sentiment score for a specific politician or topic and alert when it crosses a threshold:\\n1. Poll \`GET /api/v2/sentiment/topic/{topic}?window=2h\` on a 10-minute interval.\\n2. Track the momentum (rate of change) by comparing consecutive readings.\\n3. If the sentiment drops below -50 AND momentum is accelerating negatively, trigger an alert.\\n\\n### Pattern 3: Portfolio Risk Monitor\\nFor users with connected portfolios, create a risk monitoring script:\\n1. Fetch your portfolio holdings via \`GET /api/v2/me/portfolio/holdings\`.\\n2. For each holding, check the sector exposure and cross-reference with politically sensitive sectors.\\n3. Subscribe to \`politics:live\` and filter for events affecting your exposed sectors.\\n4. Calculate a composite risk score and alert when it exceeds your personal threshold.\\n\\n### Webhook Configuration\\nAll custom alerts should deliver notifications via webhooks. Configure your endpoint in Settings > Developer > Webhooks:\\n* **URL:** Your HTTPS endpoint that receives POST requests.\\n* **Secret:** A shared secret used to sign webhook payloads with HMAC-SHA256.\\n* **Retry Policy:** Failed deliveries are retried 3 times with exponential backoff.\\n\\n### Rate Limit Considerations\\nCustom alert scripts should implement intelligent caching to stay within rate limits. Use the batch endpoints wherever possible, and design your polling intervals to stay well under your hourly allocation. Enterprise users can request custom rate limit profiles by contacting api@arizonalex.com.`
    }
];

export const getArticlesByCategory = (categoryId: string) => {
    return helpArticles.filter(a => a.categoryId === categoryId);
}

export const getArticleById = (id: string) => {
    return helpArticles.find(a => a.id === id);
}

export const searchArticles = (query: string) => {
    const q = query.toLowerCase();
    return helpArticles.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.description.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
    );
}
