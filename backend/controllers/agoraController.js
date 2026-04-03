const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

// @desc    Generate Agora Token
// @route   GET /api/agora/token
// @access  Private
exports.generateToken = (req, res, next) => {
    try {
        const appID = process.env.AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;
        
        if (!appID || !appCertificate) {
            return res.status(500).json({ success: false, message: "Agora credentials missing in server config" });
        }

        const channelName = req.query.channelName;
        if (!channelName) {
            return res.status(400).json({ success: false, message: "Channel name is required" });
        }

        // Get uid
        let uid = req.query.uid;
        if (!uid || uid === '') {
            uid = 0;
        }

        // Get role
        let role = RtcRole.PUBLISHER;
        if (req.query.role === 'audience' || req.query.role === 'subscriber') {
            role = RtcRole.SUBSCRIBER;
        }

        const expireTime = req.query.expireTime ? parseInt(req.query.expireTime, 10) : 3600;
        const currentTime = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTime + expireTime;

        // Build token with uid
        const token = RtcTokenBuilder.buildTokenWithUid(
            appID,
            appCertificate,
            channelName,
            uid,
            role,
            privilegeExpireTime
        );

        res.status(200).json({
            success: true,
            token,
            channelName,
            uid
        });
    } catch (error) {
        next(error);
    }
};
