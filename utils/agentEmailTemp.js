exports.signUpOtpTemplateForAgents = (name, otp) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .content { padding: 30px 20px !important; }
            .otp-box { font-size: 32px !important; letter-spacing: 10px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #1a1a2e; border-bottom: 1px solid #16213e;">
                                <p style="margin: 0 0 6px; font-size: 12px; color: #a0a0b0; text-transform: uppercase; letter-spacing: 1.5px;">Agent Portal</p>
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">🌾 FarmGoo</h1>
                                <p style="margin: 6px 0 0; color: #f4a261; font-size: 13px;">Delivering freshness from farm to table</p>
                            </td>
                        </tr>

                        <!-- OTP Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">

                                <!-- Icon -->
                                <div style="margin-bottom: 20px; font-size: 50px;">🤝</div>

                                <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #1a1a2e;">Welcome, Agent!</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi <strong>${name}</strong>, your agent account on <strong>FarmGoo</strong> is almost ready! Use the OTP below to verify your email and start onboarding farmers and managing deliveries.
                                </p>

                                <!-- OTP Box -->
                                <div style="display: inline-block; background-color: #fff8f0; border: 2px dashed #f4a261; border-radius: 12px; padding: 20px 40px; margin-bottom: 30px;">
                                    <p style="margin: 0 0 6px; font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Password</p>
                                    <p class="otp-box" style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 14px; color: #e76f1e;">${otp}</p>
                                </div>

                                <p style="font-size: 14px; color: #999999; margin: 0 0 10px;">This OTP expires in <strong style="color: #1a1a2e;">10 minutes</strong>.</p>

                                <!-- Agent note -->
                                <div style="background-color: #fff8f0; border-left: 4px solid #f4a261; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 24px 0 0; text-align: left;">
                                    <p style="margin: 0; font-size: 13px; color: #c1440e; line-height: 1.5;">
                                        🤝 <strong>Once verified</strong>, you'll have full access to the FarmGoo agent dashboard — onboard farmers, request transport on their behalf, and manage deliveries all in one place.
                                    </p>
                                </div>

                                <!-- Warning -->
                                <p style="font-size: 13px; color: #999999; margin-top: 30px; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    <strong>Didn't sign up as an agent?</strong> You can safely ignore this email. Someone may have entered your email by mistake.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #1a1a2e; font-size: 12px; color: #a0a0b0;">
                                <p style="margin: 0; color: #f4a261;">🤝 Bridging farmers and the digital world.</p>
                                <p style="margin: 8px 0 0;">&copy; 2026 FarmGoo App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #f4a261; text-decoration: none;">Security Settings</a> &bull;
                                    <a href="#" style="color: #f4a261; text-decoration: none;">Contact Support</a>
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`
}

exports.resetPasswordSuccessfulTemplateForAgent = (name) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .content { padding: 30px 20px !important; }
            .cta-button { width: 100% !important; box-sizing: border-box; text-align: center; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #1a1a2e; border-bottom: 1px solid #16213e;">
                                <p style="margin: 0 0 6px; font-size: 12px; color: #a0a0b0; text-transform: uppercase; letter-spacing: 1.5px;">Agent Portal</p>
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">🌾 FarmGoo</h1>
                                <p style="margin: 6px 0 0; color: #f4a261; font-size: 13px;">Delivering freshness from farm to table</p>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">

                                <!-- Icon -->
                                <div style="margin-bottom: 20px; font-size: 50px;">✅</div>

                                <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #1a1a2e;">Password Reset Successful</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi ${name}, your <strong>FarmGoo</strong> agent account password has been successfully updated. You can now log back in and continue supporting farmers.
                                </p>

                                <!-- CTA Button -->
                                <a href="#" class="cta-button" style="display: inline-block; background-color: #1a1a2e; color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                    Log In to FarmGoo
                                </a>

                                <!-- Agent tip -->
                                <div style="background-color: #fff8f0; border-left: 4px solid #f4a261; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 30px 0 0; text-align: left;">
                                    <p style="margin: 0; font-size: 13px; color: #c1440e; line-height: 1.5;">
                                        🤝 <strong>Security tip</strong> — use a strong password you don't use on other apps to keep your agent account and your farmers' data safe.
                                    </p>
                                </div>

                                <!-- Warning -->
                                <p style="font-size: 13px; color: #999999; margin-top: 30px; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    <strong>Didn't do this?</strong> If you did not reset your password, please secure your account immediately by contacting our support team.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #1a1a2e; font-size: 12px; color: #a0a0b0;">
                                <p style="margin: 0; color: #f4a261;">🤝 Bridging farmers and the digital world.</p>
                                <p style="margin: 8px 0 0;">&copy; 2026 FarmGoo App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #f4a261; text-decoration: none;">Security Settings</a> &bull;
                                    <a href="#" style="color: #f4a261; text-decoration: none;">Contact Support</a>
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`
}

exports.forgetPasswordTemplateForAgent = (name, otp) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .content { padding: 30px 20px !important; }
            .otp-box { font-size: 32px !important; letter-spacing: 10px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #1a1a2e; border-bottom: 1px solid #16213e;">
                                <p style="margin: 0 0 6px; font-size: 12px; color: #a0a0b0; text-transform: uppercase; letter-spacing: 1.5px;">Agent Portal</p>
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">🌾 FarmGoo</h1>
                                <p style="margin: 6px 0 0; color: #f4a261; font-size: 13px;">Delivering freshness from farm to table</p>
                            </td>
                        </tr>

                        <!-- OTP Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">

                                <!-- Icon -->
                                <div style="margin-bottom: 20px; font-size: 50px;">🔐</div>

                                <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #1a1a2e;">Reset Your Password</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi ${name}, we received a request to reset your <strong>FarmGoo</strong> agent account password. Use the OTP below to proceed. If you didn't request this, you can safely ignore this email.
                                </p>

                                <!-- OTP Box -->
                                <div style="display: inline-block; background-color: #fff8f0; border: 2px dashed #f4a261; border-radius: 12px; padding: 20px 40px; margin-bottom: 30px;">
                                    <p style="margin: 0 0 6px; font-size: 12px; color: #f4a261; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Password</p>
                                    <p class="otp-box" style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 14px; color: #e76f1e;">${otp}</p>
                                </div>

                                <p style="font-size: 14px; color: #999999; margin: 0 0 10px;">This OTP expires in <strong style="color: #1a1a2e;">10 minutes</strong>.</p>

                                <!-- Agent tip -->
                                <div style="background-color: #fff8f0; border-left: 4px solid #f4a261; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 24px 0; text-align: left;">
                                    <p style="margin: 0; font-size: 13px; color: #c1440e; line-height: 1.5;">
                                        🤝 <strong>Keep your account safe</strong> — never share your OTP with anyone, including FarmGoo support staff.
                                    </p>
                                </div>

                                <!-- Warning -->
                                <p style="font-size: 13px; color: #999999; margin-top: 30px; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    <strong>Didn't request this?</strong> Your account may be at risk. Please contact our support team immediately.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #1a1a2e; font-size: 12px; color: #a0a0b0;">
                                <p style="margin: 0; color: #f4a261;">🤝 Bridging farmers and the digital world.</p>
                                <p style="margin: 8px 0 0;">&copy; 2026 FarmGoo App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #f4a261; text-decoration: none;">Security Settings</a> &bull;
                                    <a href="#" style="color: #f4a261; text-decoration: none;">Contact Support</a>
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`
}

exports.resendOtpTemplateForAgents = (name, otp) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your New OTP - FarmGoo</title>
    <style>
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .content { padding: 30px 20px !important; }
            .otp-box { font-size: 32px !important; letter-spacing: 10px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #1a1a2e; border-bottom: 1px solid #16213e;">
                                <p style="margin: 0 0 6px; font-size: 12px; color: #a0a0b0; text-transform: uppercase; letter-spacing: 1.5px;">Agent Portal</p>
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">🌾 FarmGoo</h1>
                                <p style="margin: 6px 0 0; color: #f4a261; font-size: 13px;">Delivering freshness from farm to table</p>
                            </td>
                        </tr>

                        <!-- OTP Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">

                                <!-- Icon -->
                                <div style="margin-bottom: 20px; font-size: 50px;">🔄</div>

                                <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #1a1a2e;">Here's Your New OTP</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi <strong>${name}</strong>, you requested a new verification code. Your previous OTP has been invalidated — use the one below to verify your agent account.
                                </p>

                                <!-- OTP Box -->
                                <div style="display: inline-block; background-color: #fff8f0; border: 2px dashed #f4a261; border-radius: 12px; padding: 20px 40px; margin-bottom: 30px;">
                                    <p style="margin: 0 0 6px; font-size: 12px; color: #f4a261; text-transform: uppercase; letter-spacing: 1px;">Your New One-Time Password</p>
                                    <p class="otp-box" style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 14px; color: #e76f1e;">${otp}</p>
                                </div>

                                <p style="font-size: 14px; color: #999999; margin: 0 0 10px;">This OTP expires in <strong style="color: #1a1a2e;">10 minutes</strong>.</p>

                                <!-- Resend note -->
                                <div style="background-color: #fff8f0; border-left: 4px solid #f4a261; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 24px 0; text-align: left;">
                                    <p style="margin: 0; font-size: 13px; color: #c1440e; line-height: 1.5;">
                                        🤝 If you didn't request a new code, your agent account may be at risk. Please <a href="#" style="color: #e76f1e; text-decoration: none;">contact support</a> immediately.
                                    </p>
                                </div>

                                <!-- Warning -->
                                <p style="font-size: 13px; color: #999999; margin-top: 30px; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    <strong>Didn't request this?</strong> You can safely ignore this email. Your account remains secure until this code is used.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #1a1a2e; font-size: 12px; color: #a0a0b0;">
                                <p style="margin: 0; color: #f4a261;">🤝 Bridging farmers and the digital world.</p>
                                <p style="margin: 8px 0 0;">&copy; 2026 FarmGoo App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #f4a261; text-decoration: none;">Security Settings</a> &bull;
                                    <a href="#" style="color: #f4a261; text-decoration: none;">Contact Support</a>
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`
}