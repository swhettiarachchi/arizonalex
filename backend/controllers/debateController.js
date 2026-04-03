const Debate = require('../models/Debate');
const Wallet = require('../models/Wallet');
const Escrow = require('../models/Escrow');
const Vote = require('../models/Vote');
const User = require('../models/User');

// Helper: get or create wallet
async function getOrCreateWallet(userId) {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        wallet = await Wallet.create({ user: userId });
    }
    return wallet;
}

// @desc    Create a new debate
// @route   POST /api/debates
// @access  Private
exports.createDebate = async (req, res) => {
    try {
        const { title, description, topic, category, mode, entryFee, duration, difficulty, tags, country, countries, language, debateType, isGlobal } = req.body;

        const fee = entryFee !== undefined ? Number(entryFee) : 10;

        // Check wallet balance
        if (fee > 0) {
            const wallet = await getOrCreateWallet(req.user._id);
            if (wallet.balance < fee) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient balance. You need ${fee} credits but have ${wallet.balance}.`,
                });
            }
        }

        const debate = await Debate.create({
            title,
            description: description || '',
            topic,
            category: category || 'other',
            mode: mode || 'text',
            entryFee: fee,
            duration: duration || 5,
            difficulty: difficulty || 'beginner',
            tags: tags || [],
            creator: req.user._id,
            prizePool: fee * 2, // Both participants' fees
            country: country || 'Global',
            countries: countries || [],
            language: language || 'English',
            debateType: debateType || '1v1',
            isGlobal: isGlobal || false,
        });

        // Hold entry fee in escrow
        if (fee > 0) {
            const escrow = await Escrow.create({
                debate: debate._id,
                platformFeePercent: 10,
            });
            escrow.addParticipant(req.user._id, fee);
            await escrow.save();

            debate.escrow = escrow._id;
            await debate.save();

            const wallet = await getOrCreateWallet(req.user._id);
            await wallet.holdEscrow(fee, debate._id);
        }

        const populated = await Debate.findById(debate._id)
            .populate('creator', 'name username avatar role verified')
            .populate('opponent', 'name username avatar role verified');

        // Broadcast new debate
        const io = req.app.get('io');
        if (io) {
            io.emit('debate:created', populated);
        }

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        console.error('Create debate error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to create debate' });
    }
};

// @desc    Get all debates (with filters)
// @route   GET /api/debates
// @access  Public
exports.getDebates = async (req, res) => {
    try {
        const { status, category, difficulty, mode, search, page = 1, limit = 20, sort = '-createdAt', country, language, debateType, isGlobal, entryFeeType } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (mode) filter.mode = mode;

        // Country filtering
        if (country && country !== 'GLOBAL') {
            if (isGlobal === 'true') {
                // Show both country-specific and global debates
                filter.$or = [
                    { country: country },
                    { countries: country },
                    { isGlobal: true },
                ];
            } else {
                filter.$or = [
                    { country: country },
                    { countries: country },
                ];
            }
        }
        if (isGlobal === 'only') {
            filter.isGlobal = true;
        }

        // Language filter
        if (language) filter.language = language;

        // Debate type filter
        if (debateType) filter.debateType = debateType;

        // Entry fee filter
        if (entryFeeType === 'free') filter.entryFee = 0;
        if (entryFeeType === 'paid') filter.entryFee = { $gt: 0 };

        if (search) {
            const searchFilter = [
                { title: { $regex: search, $options: 'i' } },
                { topic: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
            // Merge with existing $or if present
            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, { $or: searchFilter }];
                delete filter.$or;
            } else {
                filter.$or = searchFilter;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Debate.countDocuments(filter);

        const debates = await Debate.find(filter)
            .populate('creator', 'name username avatar role verified')
            .populate('opponent', 'name username avatar role verified')
            .populate('winner', 'name username avatar role verified')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Add vote counts to each debate
        const debatesWithVotes = await Promise.all(
            debates.map(async (d) => {
                const obj = d.toObject();
                if (d.status === 'voting' || d.status === 'completed') {
                    const { voteCounts, totalVotes } = await Vote.getDebateVotes(d._id);
                    obj.voteCounts = voteCounts;
                    obj.totalVotes = totalVotes;
                }
                return obj;
            })
        );

        res.json({
            success: true,
            data: debatesWithVotes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get debates error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch debates' });
    }
};

// @desc    Get single debate
// @route   GET /api/debates/:id
// @access  Public
exports.getDebate = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id)
            .populate('creator', 'name username avatar role verified')
            .populate('opponent', 'name username avatar role verified')
            .populate('winner', 'name username avatar role verified')
            .populate('spectators', 'name username avatar')
            .populate('messages.sender', 'name username avatar role verified');

        if (!debate) {
            return res.status(404).json({ success: false, message: 'Debate not found' });
        }

        // Increment view count
        debate.viewCount += 1;
        await debate.save();

        const obj = debate.toObject();

        // Get vote counts
        if (debate.status === 'voting' || debate.status === 'completed') {
            const { voteCounts, totalVotes } = await Vote.getDebateVotes(debate._id);
            obj.voteCounts = voteCounts;
            obj.totalVotes = totalVotes;
        }

        // Check if requesting user has voted
        if (req.user) {
            const voteStatus = await Vote.hasVoted(debate._id, req.user._id);
            obj.userVote = voteStatus;
        }

        res.json({ success: true, data: obj });
    } catch (error) {
        console.error('Get debate error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch debate' });
    }
};

// @desc    Join a debate as opponent
// @route   POST /api/debates/:id/join
// @access  Private
exports.joinDebate = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id);

        if (!debate) {
            return res.status(404).json({ success: false, message: 'Debate not found' });
        }

        if (debate.status !== 'waiting') {
            return res.status(400).json({ success: false, message: 'This debate is no longer open' });
        }

        if (debate.creator.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot join your own debate' });
        }

        if (debate.opponent) {
            return res.status(400).json({ success: false, message: 'This debate already has an opponent' });
        }

        // Check wallet balance
        if (debate.entryFee > 0) {
            const wallet = await getOrCreateWallet(req.user._id);
            if (wallet.balance < debate.entryFee) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient balance. You need ${debate.entryFee} credits.`,
                });
            }

            // Hold fee in escrow
            const escrow = await Escrow.findOne({ debate: debate._id });
            if (escrow) {
                escrow.addParticipant(req.user._id, debate.entryFee);
                await escrow.save();
            }

            await wallet.holdEscrow(debate.entryFee, debate._id);
        }

        debate.opponent = req.user._id;
        debate.prizePool = debate.entryFee * 2;
        await debate.save();

        const populated = await Debate.findById(debate._id)
            .populate('creator', 'name username avatar role verified')
            .populate('opponent', 'name username avatar role verified');

        // Broadcast
        const io = req.app.get('io');
        if (io) {
            io.emit('debate:joined', populated);
            io.to(`debate:${debate._id}`).emit('debate:opponent_joined', populated);
        }

        res.json({ success: true, data: populated });
    } catch (error) {
        console.error('Join debate error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to join debate' });
    }
};

// @desc    Start a debate
// @route   POST /api/debates/:id/start
// @access  Private (creator only)
exports.startDebate = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id);

        if (!debate) {
            return res.status(404).json({ success: false, message: 'Debate not found' });
        }

        if (debate.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the creator can start the debate' });
        }

        if (debate.status !== 'waiting') {
            return res.status(400).json({ success: false, message: 'Debate cannot be started in current state' });
        }

        if (!debate.opponent) {
            return res.status(400).json({ success: false, message: 'Need an opponent to start' });
        }

        debate.status = 'live';
        debate.startedAt = new Date();
        await debate.save();

        const populated = await Debate.findById(debate._id)
            .populate('creator', 'name username avatar role verified')
            .populate('opponent', 'name username avatar role verified');

        // Broadcast
        const io = req.app.get('io');
        if (io) {
            io.emit('debate:started', populated);
            io.to(`debate:${debate._id}`).emit('debate:go_live', populated);
        }

        // Schedule auto-end after duration
        setTimeout(async () => {
            try {
                const d = await Debate.findById(debate._id);
                if (d && d.status === 'live') {
                    d.status = 'voting';
                    d.endedAt = new Date();
                    d.votingDeadline = new Date(Date.now() + d.votingDuration * 60000);
                    await d.save();

                    const pop = await Debate.findById(d._id)
                        .populate('creator', 'name username avatar role verified')
                        .populate('opponent', 'name username avatar role verified');

                    if (io) {
                        io.emit('debate:ended', pop);
                        io.to(`debate:${d._id}`).emit('debate:voting_started', pop);
                    }

                    // Schedule voting end
                    setTimeout(async () => {
                        try {
                            await finalizeDebate(d._id, io);
                        } catch (e) {
                            console.error('Finalize debate error:', e);
                        }
                    }, d.votingDuration * 60000);
                }
            } catch (e) {
                console.error('Auto-end debate error:', e);
            }
        }, debate.duration * 60000);

        res.json({ success: true, data: populated });
    } catch (error) {
        console.error('Start debate error:', error);
        res.status(500).json({ success: false, message: 'Failed to start debate' });
    }
};

// @desc    Send a message in a live debate
// @route   POST /api/debates/:id/message
// @access  Private (participants only)
exports.sendMessage = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id);

        if (!debate) {
            return res.status(404).json({ success: false, message: 'Debate not found' });
        }

        if (debate.status !== 'live') {
            return res.status(400).json({ success: false, message: 'Debate is not live' });
        }

        const userId = req.user._id.toString();
        const isParticipant = debate.creator.toString() === userId || (debate.opponent && debate.opponent.toString() === userId);

        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Only participants can send messages' });
        }

        const message = {
            sender: req.user._id,
            content: req.body.content,
            timestamp: new Date(),
        };

        debate.messages.push(message);
        await debate.save();

        // Populate sender
        const populatedMsg = {
            ...message,
            sender: {
                _id: req.user._id,
                name: req.user.name,
                username: req.user.username,
                avatar: req.user.avatar,
                role: req.user.role,
                verified: req.user.verified,
            },
        };

        // Broadcast
        const io = req.app.get('io');
        if (io) {
            io.to(`debate:${debate._id}`).emit('debate:message', {
                debateId: debate._id,
                message: populatedMsg,
            });
        }

        res.json({ success: true, data: populatedMsg });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

// @desc    Get debate messages
// @route   GET /api/debates/:id/messages
// @access  Public
exports.getMessages = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id)
            .select('messages')
            .populate('messages.sender', 'name username avatar role verified');

        if (!debate) {
            return res.status(404).json({ success: false, message: 'Debate not found' });
        }

        res.json({ success: true, data: debate.messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
};

// @desc    Join as spectator
// @route   POST /api/debates/:id/spectate
// @access  Private
exports.spectateDebate = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id);

        if (!debate) {
            return res.status(404).json({ success: false, message: 'Debate not found' });
        }

        if (debate.spectators.length >= debate.maxSpectators) {
            return res.status(400).json({ success: false, message: 'Debate room is full' });
        }

        const userId = req.user._id;
        if (!debate.spectators.includes(userId)) {
            debate.spectators.push(userId);
            await debate.save();
        }

        const io = req.app.get('io');
        if (io) {
            io.to(`debate:${debate._id}`).emit('debate:spectator_joined', {
                debateId: debate._id,
                spectatorCount: debate.spectators.length,
                user: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
            });
        }

        res.json({ success: true, data: { spectatorCount: debate.spectators.length } });
    } catch (error) {
        console.error('Spectate error:', error);
        res.status(500).json({ success: false, message: 'Failed to join as spectator' });
    }
};

// @desc    Cast a vote
// @route   POST /api/debates/:id/vote
// @access  Private
exports.castVote = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id);

        if (!debate) {
            return res.status(404).json({ success: false, message: 'Debate not found' });
        }

        if (debate.status !== 'voting') {
            return res.status(400).json({ success: false, message: 'Voting is not open for this debate' });
        }

        if (debate.votingDeadline && new Date() > debate.votingDeadline) {
            return res.status(400).json({ success: false, message: 'Voting period has ended' });
        }

        // Can't vote in own debate
        const userId = req.user._id.toString();
        if (debate.creator.toString() === userId || (debate.opponent && debate.opponent.toString() === userId)) {
            return res.status(400).json({ success: false, message: 'Participants cannot vote in their own debate' });
        }

        // Check if already voted
        const existing = await Vote.findOne({ debate: debate._id, voter: req.user._id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already voted in this debate' });
        }

        const { votedFor } = req.body;

        // Validate votedFor is a participant
        if (votedFor !== debate.creator.toString() && (!debate.opponent || votedFor !== debate.opponent.toString())) {
            return res.status(400).json({ success: false, message: 'Invalid vote target — must be a debate participant' });
        }

        const vote = await Vote.create({
            debate: debate._id,
            voter: req.user._id,
            votedFor,
            ip: req.ip || req.headers['x-forwarded-for'] || '',
            userAgent: req.headers['user-agent'] || '',
        });

        // Get updated counts
        const { voteCounts, totalVotes } = await Vote.getDebateVotes(debate._id);

        // Broadcast vote update
        const io = req.app.get('io');
        if (io) {
            io.to(`debate:${debate._id}`).emit('debate:vote_update', {
                debateId: debate._id,
                voteCounts,
                totalVotes,
            });
            io.emit('debate:vote_cast', {
                debateId: debate._id,
                totalVotes,
            });
        }

        res.json({
            success: true,
            data: { vote, voteCounts, totalVotes },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already voted in this debate' });
        }
        console.error('Cast vote error:', error);
        res.status(500).json({ success: false, message: 'Failed to cast vote' });
    }
};

// @desc    Get vote status
// @route   GET /api/debates/:id/votes
// @access  Public
exports.getVotes = async (req, res) => {
    try {
        const { voteCounts, totalVotes } = await Vote.getDebateVotes(req.params.id);

        let userVote = null;
        if (req.user) {
            userVote = await Vote.hasVoted(req.params.id, req.user._id);
        }

        res.json({ success: true, data: { voteCounts, totalVotes, userVote } });
    } catch (error) {
        console.error('Get votes error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch votes' });
    }
};

// @desc    Cancel a debate
// @route   POST /api/debates/:id/cancel
// @access  Private (creator only, while in 'waiting' status)
exports.cancelDebate = async (req, res) => {
    try {
        const debate = await Debate.findById(req.params.id);

        if (!debate) {
            return res.status(404).json({ success: false, message: 'Debate not found' });
        }

        if (debate.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the creator can cancel' });
        }

        if (debate.status !== 'waiting') {
            return res.status(400).json({ success: false, message: 'Can only cancel debates that haven\'t started' });
        }

        debate.status = 'cancelled';
        await debate.save();

        // Refund escrow
        if (debate.escrow) {
            const escrow = await Escrow.findById(debate.escrow);
            if (escrow) {
                escrow.refundAll();
                await escrow.save();

                // Refund participants
                for (const p of escrow.participants) {
                    const wallet = await getOrCreateWallet(p.user);
                    await wallet.refundEscrow(p.amount, debate._id);
                }
            }
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('debate:cancelled', { debateId: debate._id });
        }

        res.json({ success: true, message: 'Debate cancelled and funds refunded' });
    } catch (error) {
        console.error('Cancel debate error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel debate' });
    }
};

// Finalize debate — determine winner and distribute prizes
async function finalizeDebate(debateId, io) {
    const debate = await Debate.findById(debateId);
    if (!debate || debate.status !== 'voting') return;

    const { voteCounts, totalVotes } = await Vote.getDebateVotes(debateId);

    // Run fraud detection
    await Vote.detectFraud(debateId);

    // Recalculate after fraud removal
    const cleanVotes = await Vote.getDebateVotes(debateId);

    const creatorId = debate.creator.toString();
    const opponentId = debate.opponent ? debate.opponent.toString() : null;

    const creatorVotes = cleanVotes.voteCounts[creatorId] || 0;
    const opponentVotes = opponentId ? (cleanVotes.voteCounts[opponentId] || 0) : 0;

    let winnerId = null;
    let isDraw = false;

    if (creatorVotes > opponentVotes) {
        winnerId = debate.creator;
    } else if (opponentVotes > creatorVotes) {
        winnerId = debate.opponent;
    } else {
        isDraw = true;
    }

    debate.winner = winnerId;
    debate.isDraw = isDraw;
    debate.status = 'completed';
    await debate.save();

    // Handle escrow release
    if (debate.escrow) {
        const escrow = await Escrow.findById(debate.escrow);
        if (escrow) {
            if (isDraw) {
                const perPerson = escrow.handleDraw();
                await escrow.save();

                // Refund each participant (minus platform fee split)
                const creatorWallet = await getOrCreateWallet(debate.creator);
                await creatorWallet.releaseEscrowWinnings(perPerson, debateId);
                creatorWallet.escrowBalance = Math.max(0, creatorWallet.escrowBalance - debate.entryFee);
                await creatorWallet.save();

                if (debate.opponent) {
                    const opponentWallet = await getOrCreateWallet(debate.opponent);
                    await opponentWallet.releaseEscrowWinnings(perPerson, debateId);
                    opponentWallet.escrowBalance = Math.max(0, opponentWallet.escrowBalance - debate.entryFee);
                    await opponentWallet.save();
                }
            } else if (winnerId) {
                const prizeAmount = escrow.releaseToWinner(winnerId);
                await escrow.save();

                const winnerWallet = await getOrCreateWallet(winnerId);
                await winnerWallet.releaseEscrowWinnings(prizeAmount, debateId);
                winnerWallet.escrowBalance = Math.max(0, winnerWallet.escrowBalance - debate.entryFee);
                await winnerWallet.save();

                // Update loser wallet escrow balance
                const loserId = winnerId.toString() === creatorId ? debate.opponent : debate.creator;
                if (loserId) {
                    const loserWallet = await getOrCreateWallet(loserId);
                    loserWallet.escrowBalance = Math.max(0, loserWallet.escrowBalance - debate.entryFee);
                    loserWallet.totalDebates += 1;
                    await loserWallet.save();
                }
            }
        }
    }

    // Update wallet debate counts
    const cWallet = await getOrCreateWallet(debate.creator);
    cWallet.totalDebates += 1;
    await cWallet.save();

    if (debate.opponent) {
        const oWallet = await getOrCreateWallet(debate.opponent);
        oWallet.totalDebates += 1;
        await oWallet.save();
    }

    const populated = await Debate.findById(debateId)
        .populate('creator', 'name username avatar role verified')
        .populate('opponent', 'name username avatar role verified')
        .populate('winner', 'name username avatar role verified');

    // Broadcast result
    if (io) {
        io.emit('debate:completed', populated);
        io.to(`debate:${debateId}`).emit('debate:result', {
            debate: populated,
            voteCounts: cleanVotes.voteCounts,
            totalVotes: cleanVotes.totalVotes,
        });
    }
}

exports.finalizeDebate = finalizeDebate;

// @desc    Get country leaderboard
// @route   GET /api/debates/leaderboard/:country
// @access  Public
exports.getCountryLeaderboard = async (req, res) => {
    try {
        const { country } = req.params;
        const countryFilter = country === 'GLOBAL' ? {} : { country };

        // Aggregate top debaters by wins
        const leaderboard = await Debate.aggregate([
            { $match: { ...countryFilter, status: 'completed', winner: { $ne: null } } },
            { $group: {
                _id: '$winner',
                wins: { $sum: 1 },
                earnings: { $sum: '$prizePool' },
                debates: { $sum: 1 },
            }},
            { $sort: { wins: -1 } },
            { $limit: 20 },
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
            }},
            { $unwind: '$user' },
            { $project: {
                _id: 0,
                user: { _id: '$user._id', name: '$user.name', username: '$user.username', avatar: '$user.avatar', role: '$user.role', verified: '$user.verified' },
                wins: 1,
                earnings: 1,
                debates: 1,
                country: country,
            }},
        ]);

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        console.error('Country leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
    }
};

// @desc    Get trending debates by country
// @route   GET /api/debates/trending/:country
// @access  Public
exports.getTrendingByCountry = async (req, res) => {
    try {
        const { country } = req.params;
        const countryFilter = country === 'GLOBAL' ? {} : {
            $or: [{ country }, { countries: country }, { isGlobal: true }],
        };

        const trending = await Debate.find({
            ...countryFilter,
            status: { $in: ['waiting', 'live', 'voting'] },
        })
            .populate('creator', 'name username avatar role verified')
            .populate('opponent', 'name username avatar role verified')
            .sort({ viewCount: -1, spectators: -1, createdAt: -1 })
            .limit(10);

        res.json({ success: true, data: trending });
    } catch (error) {
        console.error('Trending by country error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch trending debates' });
    }
};

// @desc    Get country stats
// @route   GET /api/debates/stats/countries
// @access  Public
exports.getCountryStats = async (req, res) => {
    try {
        const stats = await Debate.aggregate([
            { $match: { country: { $ne: null } } },
            { $group: {
                _id: '$country',
                totalDebates: { $sum: 1 },
                liveCount: { $sum: { $cond: [{ $eq: ['$status', 'live'] }, 1, 0] } },
                waitingCount: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
                completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                categories: { $push: '$category' },
            }},
            { $sort: { totalDebates: -1 } },
            { $limit: 50 },
        ]);

        // Compute top category for each
        const result = stats.map(s => {
            const catCounts = {};
            (s.categories || []).forEach(c => { catCounts[c] = (catCounts[c] || 0) + 1; });
            const topCategory = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0] || 'other';
            return {
                country: s._id,
                totalDebates: s.totalDebates,
                liveCount: s.liveCount,
                waitingCount: s.waitingCount,
                completedCount: s.completedCount,
                topCategory,
            };
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Country stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch country stats' });
    }
};
