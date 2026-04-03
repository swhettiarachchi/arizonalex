const nodemailer = require('nodemailer');

// Create transporter — uses Ethereal in dev if no SMTP configured
let transporter;

async function getTransporter() {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Fallback: Ethereal test account for dev
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log('[Email] Using Ethereal test account:', testAccount.user);
    }
    return transporter;
}

const FROM = () => process.env.FROM_EMAIL || 'security@arizonalex.com';

// ── Send OTP code ──
async function sendOTPEmail(to, otp, purpose = 'verification') {
    const t = await getTransporter();
    const subjects = {
        verification: 'Your Arizonalex Verification Code',
        '2fa_login': 'Your Arizonalex Login Code',
        '2fa_enable': 'Enable Two-Factor Authentication',
        'email_change': 'Verify Your New Email Address',
        'password_reset': 'Password Reset Code',
    };
    const info = await t.sendMail({
        from: `"Arizonalex Security" <${FROM()}>`,
        to,
        subject: subjects[purpose] || 'Arizonalex Security Code',
        html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f13;border-radius:16px;color:#e5e5e5;">
                <div style="text-align:center;margin-bottom:24px;">
                    <h2 style="color:#a78bfa;margin:0 0 8px;">Arizonalex</h2>
                    <p style="color:#888;font-size:14px;margin:0;">Account Security</p>
                </div>
                <div style="background:#1a1a24;border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
                    <p style="color:#aaa;font-size:14px;margin:0 0 12px;">Your ${purpose.replace(/_/g, ' ')} code is:</p>
                    <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#fff;background:#252530;padding:16px;border-radius:8px;display:inline-block;">${otp}</div>
                </div>
                <p style="color:#888;font-size:13px;text-align:center;">This code expires in <strong style="color:#e5e5e5;">5 minutes</strong>. Do not share it with anyone.</p>
                <hr style="border:none;border-top:1px solid #252530;margin:20px 0;">
                <p style="color:#555;font-size:11px;text-align:center;">If you didn't request this code, please ignore this email or contact support.</p>
            </div>
        `,
    });
    console.log('[Email] Sent to', to, '| Preview:', nodemailer.getTestMessageUrl(info) || 'N/A');
    return info;
}

// ── Send alert email ──
async function sendAlertEmail(to, title, message) {
    const t = await getTransporter();
    const info = await t.sendMail({
        from: `"Arizonalex Security" <${FROM()}>`,
        to,
        subject: `Security Alert: ${title}`,
        html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f13;border-radius:16px;color:#e5e5e5;">
                <div style="text-align:center;margin-bottom:24px;">
                    <h2 style="color:#a78bfa;margin:0 0 8px;">Arizonalex</h2>
                    <p style="color:#888;font-size:14px;margin:0;">Security Alert</p>
                </div>
                <div style="background:#1a1a24;border-radius:12px;padding:24px;margin-bottom:20px;">
                    <h3 style="color:#f87171;margin:0 0 12px;">${title}</h3>
                    <p style="color:#ccc;font-size:14px;line-height:1.6;margin:0;">${message}</p>
                </div>
                <p style="color:#555;font-size:11px;text-align:center;">If this wasn't you, secure your account immediately.</p>
            </div>
        `,
    });
    return info;
}

module.exports = { sendOTPEmail, sendAlertEmail };
