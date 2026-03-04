const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Models
const User = require('../models/User');
const Post = require('../models/Post');
const Poll = require('../models/Poll');
const PromiseItem = require('../models/Promise');
const Event = require('../models/Event');
const Story = require('../models/Story');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear all collections
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Post.deleteMany({}),
            Poll.deleteMany({}),
            PromiseItem.deleteMany({}),
            Event.deleteMany({}),
            Story.deleteMany({}),
            Notification.deleteMany({}),
            Conversation.deleteMany({}),
            Message.deleteMany({}),
        ]);

        // ---- SEED USERS ----
        console.log('👥 Seeding users...');
        const password = await bcrypt.hash('password123', 12);

        const usersData = [
            { name: 'Sarah Mitchell', email: 'sarah@arizonalex.com', username: 'sarahmitchell', password, avatar: '/avatars/sarah-mitchell.png', bio: 'Senator, District 12. Fighting for transparent governance and equal opportunity.', role: 'politician', verified: true, party: 'Progressive Alliance', banner: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
            { name: 'James Rivera', email: 'james@arizonalex.com', username: 'jamesrivera', password, avatar: '/avatars/james-rivera.png', bio: 'Political journalist @NationalPost. Covering Capitol Hill since 2015.', role: 'journalist', verified: true },
            { name: 'Diana Chen', email: 'diana@arizonalex.com', username: 'dianachen', password, avatar: '/avatars/diana-chen.png', bio: 'Governor of State. Building bridges, not walls. #TransparentGovernance', role: 'politician', verified: true, party: 'Unity Party' },
            { name: 'Marcus Thompson', email: 'marcus@arizonalex.com', username: 'marcusthompson', password, avatar: '/avatars/marcus-thompson.png', bio: 'City Council Member. Your voice in local government.', role: 'official', verified: true, party: 'Citizens First' },
            { name: 'Alex Jordan', email: 'alex@arizonalex.com', username: 'alexjordan', password, avatar: '/avatars/alex-jordan.png', bio: 'Engaged citizen. Democracy is not a spectator sport.', role: 'citizen', verified: false },
            { name: 'Priya Patel', email: 'priya@arizonalex.com', username: 'priyapatel', password, avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&h=200&auto=format&fit=crop', bio: 'Policy researcher & analyst. Data-driven governance advocate.', role: 'journalist', verified: true },
            { name: 'Robert Kim', email: 'robert@arizonalex.com', username: 'robertkim', password, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop', bio: "Secretary of Infrastructure. Rebuilding America's future.", role: 'politician', verified: true, party: 'National Progress' },
            { name: 'Elena Vasquez', email: 'elena@arizonalex.com', username: 'elenavasquez', password, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop', bio: 'Education policy champion. Every child deserves a future.', role: 'politician', verified: true, party: 'Progressive Alliance' },
            { name: 'Admin User', email: 'admin@arizonalex.com', username: 'admin', password, avatar: '', bio: 'Platform administrator', role: 'admin', verified: true },
        ];

        const users = await User.insertMany(usersData);
        console.log(`   ✅ Created ${users.length} users`);

        // Add some followers/following relationships
        await User.findByIdAndUpdate(users[0]._id, { $addToSet: { followers: [users[4]._id, users[1]._id, users[5]._id] } });
        await User.findByIdAndUpdate(users[4]._id, { $addToSet: { following: [users[0]._id, users[2]._id] } });
        await User.findByIdAndUpdate(users[2]._id, { $addToSet: { followers: [users[4]._id, users[3]._id] } });

        // ---- SEED POSTS ----
        console.log('📝 Seeding posts...');
        const postsData = [
            { author: users[0]._id, content: '🏛️ Today we passed the Digital Privacy Act with bipartisan support. This landmark legislation will protect citizens\' data from corporate overreach while maintaining innovation. A win for democracy!\n\n#DigitalPrivacy #Governance #Transparency', type: 'text' },
            { author: users[1]._id, content: 'BREAKING: Leaked documents reveal massive infrastructure spending discrepancies between reported and actual allocations. Full investigation report dropping tomorrow.\n\nStay tuned. 🔍', type: 'text' },
            { author: users[2]._id, content: 'Proud to announce our state\'s new Green Energy Initiative. By 2030, we aim for 80% renewable energy. Here\'s our roadmap:\n\n✅ Phase 1: Solar farm expansion (2025)\n✅ Phase 2: Wind energy corridors (2026)\n✅ Phase 3: EV infrastructure (2027)\n🔄 Phase 4: Grid modernization (2028-2030)\n\n#CleanEnergy #GreenFuture', type: 'policy' },
            { author: users[3]._id, content: 'Town Hall tonight at 7 PM! We\'re discussing the new community development plan. Your input matters. See you there! 🏘️\n\nLocation: City Hall, Room 204\nLive stream: arizonalex.com/live/townhall', type: 'text' },
            { author: users[5]._id, content: '📊 New Research: Our analysis of 10,000+ policy proposals reveals that data-driven legislation has a 73% higher success rate in achieving stated objectives.\n\nKey findings in this thread 🧵👇', type: 'thread' },
            { author: users[6]._id, content: '🚄 The National High-Speed Rail project just broke ground in 3 new states! This will connect 15 major cities by 2029, creating 200,000+ jobs.\n\nInfrastructure is not just concrete and steel — it\'s opportunity.', type: 'text' },
            { author: users[7]._id, content: '📚 Excited to share: Our Universal Pre-K bill passed committee today! Every 4-year-old in our state will have access to quality early education by 2026.\n\nThis is what investing in our future looks like.', type: 'text' },
            { author: users[4]._id, content: 'Attended my first town hall meeting today. Impressed by how engaged local officials were with community concerns. This is what democracy should look like! 🗳️', type: 'text' },
        ];

        const posts = await Post.insertMany(postsData);
        console.log(`   ✅ Created ${posts.length} posts`);

        // Add some likes
        await Post.findByIdAndUpdate(posts[0]._id, { $addToSet: { likes: [users[1]._id, users[4]._id, users[5]._id] } });
        await Post.findByIdAndUpdate(posts[2]._id, { $addToSet: { likes: [users[0]._id, users[4]._id, users[6]._id, users[7]._id] } });
        await Post.findByIdAndUpdate(posts[5]._id, { $addToSet: { likes: [users[0]._id, users[2]._id, users[3]._id] } });

        // ---- SEED POLLS ----
        console.log('📊 Seeding polls...');
        const pollsData = [
            {
                question: 'Should the government increase funding for renewable energy projects?',
                options: [
                    { label: 'Strongly Agree', votes: [users[0]._id, users[4]._id] },
                    { label: 'Agree', votes: [users[1]._id] },
                    { label: 'Neutral', votes: [] },
                    { label: 'Disagree', votes: [users[3]._id] },
                    { label: 'Strongly Disagree', votes: [] },
                ],
                endDate: new Date('2026-03-15'), author: users[2]._id,
            },
            {
                question: 'What should be the top priority for the next legislative session?',
                options: [
                    { label: 'Healthcare Reform', votes: [users[4]._id, users[5]._id] },
                    { label: 'Education Funding', votes: [users[7]._id] },
                    { label: 'Infrastructure', votes: [users[6]._id] },
                    { label: 'Climate Policy', votes: [users[2]._id] },
                    { label: 'Economic Growth', votes: [users[3]._id] },
                ],
                endDate: new Date('2026-03-20'), author: users[0]._id,
            },
        ];
        const polls = await Poll.insertMany(pollsData);
        console.log(`   ✅ Created ${polls.length} polls`);

        // ---- SEED PROMISES ----
        console.log('🤝 Seeding promises...');
        const promisesData = [
            { title: 'Universal Pre-K Access', description: 'Implement free pre-K for all 4-year-olds by 2026.', status: 'in-progress', politician: users[7]._id, date: new Date('2025-01-01'), category: 'Education' },
            { title: 'Reduce Carbon Emissions by 50%', description: 'Achieve 50% reduction in state carbon emissions by 2028.', status: 'in-progress', politician: users[2]._id, date: new Date('2024-03-01'), category: 'Environment' },
            { title: 'High-Speed Rail Expansion', description: 'Connect 15 major cities with high-speed rail by 2029.', status: 'in-progress', politician: users[6]._id, date: new Date('2024-06-01'), category: 'Infrastructure' },
            { title: 'Digital Privacy Act', description: 'Pass comprehensive digital privacy legislation.', status: 'kept', politician: users[0]._id, date: new Date('2025-02-01'), category: 'Privacy' },
            { title: 'Balanced Budget', description: 'Achieve balanced state budget within first term.', status: 'broken', politician: users[3]._id, date: new Date('2023-01-01'), category: 'Economy' },
            { title: 'Police Reform', description: 'Implement community policing standards statewide.', status: 'pending', politician: users[2]._id, date: new Date('2024-09-01'), category: 'Justice' },
        ];
        const promises = await PromiseItem.insertMany(promisesData);
        console.log(`   ✅ Created ${promises.length} promises`);

        // ---- SEED EVENTS ----
        console.log('📅 Seeding events...');
        const eventsData = [
            { title: 'State of the State Address', type: 'speech', date: new Date('2026-03-05'), location: 'Capitol Building', organizer: users[2]._id, description: 'Annual address covering policy priorities and achievements.' },
            { title: 'Community Town Hall: Education', type: 'townhall', date: new Date('2026-03-08'), location: 'City Hall, Room 204', organizer: users[3]._id, description: 'Open discussion on local education initiatives.' },
            { title: 'Climate Policy Debate', type: 'debate', date: new Date('2026-03-12'), location: 'Virtual Event', organizer: users[5]._id, description: 'Bipartisan debate on climate change legislation.' },
            { title: 'Infrastructure Rally', type: 'rally', date: new Date('2026-03-15'), location: 'Downtown Convention Center', organizer: users[6]._id, description: 'Rally for the National Infrastructure Investment Act.' },
        ];
        const events = await Event.insertMany(eventsData);
        console.log(`   ✅ Created ${events.length} events`);

        // ---- SEED STORIES ----
        console.log('📖 Seeding stories...');
        const storiesData = [
            { author: users[0]._id, image: '🏛️', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
            { author: users[2]._id, image: '🌿', expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000) },
            { author: users[6]._id, image: '🚄', expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000) },
            { author: users[7]._id, image: '📚', expiresAt: new Date(Date.now() + 15 * 60 * 60 * 1000) },
            { author: users[1]._id, image: '🔍', expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) },
            { author: users[5]._id, image: '📊', expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000) },
            { author: users[3]._id, image: '🏘️', expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) },
        ];
        const storiesResult = await Story.insertMany(storiesData);
        console.log(`   ✅ Created ${storiesResult.length} stories`);

        // ---- SEED NOTIFICATIONS ----
        console.log('🔔 Seeding notifications...');
        const notificationsData = [
            { recipient: users[4]._id, type: 'like', actor: users[0]._id, content: 'liked your post about civic engagement', read: false },
            { recipient: users[4]._id, type: 'follow', actor: users[1]._id, content: 'started following you', read: false },
            { recipient: users[4]._id, type: 'comment', actor: users[2]._id, content: 'commented on your policy thread', read: false },
            { recipient: users[4]._id, type: 'repost', actor: users[5]._id, content: 'reposted your research analysis', read: true },
            { recipient: users[4]._id, type: 'mention', actor: users[3]._id, content: 'mentioned you in a town hall discussion', read: true },
            { recipient: users[4]._id, type: 'verification', content: 'Your verification request is being reviewed', read: true },
            { recipient: users[4]._id, type: 'system', content: 'New AI tools are now available in your dashboard', read: true },
            { recipient: users[4]._id, type: 'like', actor: users[6]._id, content: 'liked your comment on infrastructure bill', read: true },
        ];
        const notifs = await Notification.insertMany(notificationsData);
        console.log(`   ✅ Created ${notifs.length} notifications`);

        // ---- SEED CONVERSATIONS & MESSAGES ----
        console.log('💬 Seeding conversations & messages...');
        const conv = await Conversation.create({
            participants: [users[4]._id, users[0]._id],
            lastMessage: "I'll review them thoroughly and let you know. Thanks for being transparent about this!",
        });

        const messagesData = [
            { conversation: conv._id, sender: users[0]._id, content: 'Hi! I wanted to discuss the upcoming infrastructure vote.', read: true },
            { conversation: conv._id, sender: users[4]._id, content: 'Of course, Senator. I have some concerns about the environmental impact assessment.', read: true },
            { conversation: conv._id, sender: users[0]._id, content: "Valid point. We've added new amendments addressing exactly that. I'll share the updated draft.", read: true },
            { conversation: conv._id, sender: users[4]._id, content: 'That would be great. When is the final vote scheduled?', read: true },
            { conversation: conv._id, sender: users[0]._id, content: "Next Thursday. I'd appreciate your public support if the amendments address your concerns.", read: true },
            { conversation: conv._id, sender: users[4]._id, content: "I'll review them thoroughly and let you know. Thanks for being transparent about this!", read: false },
        ];
        const msgs = await Message.insertMany(messagesData);
        console.log(`   ✅ Created 1 conversation with ${msgs.length} messages`);

        // ---- DONE ----
        console.log('\n🎉 Database seeded successfully!');
        console.log('─────────────────────────────────');
        console.log('  Default password for all users: password123');
        console.log('  Admin login: admin@arizonalex.com / password123');
        console.log('  Test user: alex@arizonalex.com / password123');
        console.log('─────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDB();
