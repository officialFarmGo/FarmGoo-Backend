exports.emailTemplate = (fullname, otp)=>{
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email verification</title>
</head>
<body style = "width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center">
    <div style = "color: blue; align-items:center; justify-content: center;"><h1>Email OTP verification</h1></div>
    <div class = ""><h2>Hello ${fullname}</h2></div>
    <div class = "bodydiv"><P>Below is your one
         time passcode that you need to use to complete your authentication. <br>
         The verification code will be valid for 30 minutes. Please do not share this code with anyone </P>
        </div>  
        <div class = "otp" style = "color: blue">${otp}</div>

        <div class = "bottombody"><p>If you are experiencing issues with your account, please don't hesitate to contact us. 
            <br> Enjoy the fastest and most secure way to buy airtime. Mobile data and to pay bills. 
        </p></div>
        <div class = "footerdiv"><p>If you would like to know more about our services, please also reach out to our team.</p></div>
    
</body>
</html>`
}


exports.resetPasswordSuccessfulTemplateforFarmer = (name) => {
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
<body style="margin: 0; padding: 0; background-color: #f0faf4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0faf4;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #2d6a4f; border-bottom: 1px solid #1b4332;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">🌾 FarmGoo</h1>
                                <p style="margin: 6px 0 0; color: #95d5b2; font-size: 13px;">Your trusted farming companion</p>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">

                                <!-- Icon -->
                                <div style="margin-bottom: 20px; font-size: 50px;">✅</div>

                                <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #1b4332;">Password Reset Successful</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi ${name}, your <strong>FarmGoo</strong> password has been successfully updated. You can now log back in and get back to managing your farm.
                                </p>

                                <!-- CTA Button -->
                                <a href="#" class="cta-button" style="display: inline-block; background-color: #2d6a4f; color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                    Log In to FarmGoo
                                </a>

                                <!-- Farm tip -->
                                <div style="background-color: #f0faf4; border-left: 4px solid #52b788; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 30px 0 0; text-align: left;">
                                    <p style="margin: 0; font-size: 13px; color: #2d6a4f; line-height: 1.5;">
                                        🌱 <strong>Security tip</strong> — use a strong password you don't use on other apps to keep your farm data safe.
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
                            <td align="center" style="padding: 25px; background-color: #f0faf4; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0; color: #52b788;">🌾 Growing together, one harvest at a time.</p>
                                <p style="margin: 8px 0 0;">&copy; 2026 FarmGoo App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #2d6a4f; text-decoration: none;">Security Settings</a> &bull;
                                    <a href="#" style="color: #2d6a4f; text-decoration: none;">Contact Support</a>
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
exports.signUpOtpTemplateforFarmers = (name, otp) => {
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
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                                <p style="margin: 0 0 6px; font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1.5px;">Farmer Portal</p>
                                <h1 style="margin: 0; color: #00d2ff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">FarmGoo</h1>
                            </td>
                        </tr>

                        <!-- OTP Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">

                                <!-- Icon -->
                                <div style="margin-bottom: 20px; font-size: 50px;">🌱</div>

                                <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #1a1a1a;">Welcome to the Farm!</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi <strong>${name}</strong>, your farmer account on <strong>FarmGoo</strong> is almost ready! Use the OTP below to verify your email and complete your registration.
                                </p>

                                <!-- OTP Box -->
                                <div style="display: inline-block; background-color: #f0fbff; border: 2px dashed #00d2ff; border-radius: 12px; padding: 20px 40px; margin-bottom: 30px;">
                                    <p style="margin: 0 0 6px; font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Password</p>
                                    <p class="otp-box" style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 14px; color: #00d2ff;">${otp}</p>
                                </div>

                                <p style="font-size: 14px; color: #999999; margin: 0 0 10px;">This OTP expires in <strong style="color: #1a1a1a;">10 minutes</strong>.</p>

                                <!-- Farmer note -->
                                <p style="font-size: 14px; color: #666666; margin: 20px 0 0; background-color: #f9fef0; border-left: 3px solid #7bc142; padding: 12px 16px; border-radius: 6px; text-align: left;">
                                    🌾 Once verified, you'll have full access to the FarmGoo farmer dashboard — manage your produce, track orders, and connect with buyers directly.
                                </p>

                                <!-- Warning -->
                                <p style="font-size: 13px; color: #999999; margin-top: 30px; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    <strong>Didn't sign up as a farmer?</strong> You can safely ignore this email. Someone may have entered your email by mistake.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #fafafa; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0;">&copy; 2026 FarmGoo App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Security Settings</a> &bull;
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Contact Support</a>
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

exports.forgetPasswordTemplateforFarmer = (name, otp) => {
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
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #2d6a4f; border-bottom: 1px solid #1b4332;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">🌾 FarmGoo</h1>
                                <p style="margin: 6px 0 0; color: #95d5b2; font-size: 13px;">Your trusted farming companion</p>
                            </td>
                        </tr>

                        <!-- OTP Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">

                                <!-- Icon -->
                                <div style="margin-bottom: 20px; font-size: 50px;">🔐</div>

                                <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #1b4332;">Reset Your Password</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi ${name}, we received a request to reset your <strong>FarmGoo</strong> password. Use the OTP below to proceed. If you didn't request this, you can safely ignore this email.
                                </p>

                                <!-- OTP Box -->
                                <div style="display: inline-block; background-color: #d8f3dc; border: 2px dashed #2d6a4f; border-radius: 12px; padding: 20px 40px; margin-bottom: 30px;">
                                    <p style="margin: 0 0 6px; font-size: 12px; color: #52b788; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Password</p>
                                    <p class="otp-box" style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 14px; color: #1b4332;">${otp}</p>
                                </div>

                                <p style="font-size: 14px; color: #999999; margin: 0 0 10px;">This OTP expires in <strong style="color: #1b4332;">10 minutes</strong>.</p>

                                <!-- Farm tip -->
                                <div style="background-color: #f0faf4; border-left: 4px solid #52b788; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 24px 0; text-align: left;">
                                    <p style="margin: 0; font-size: 13px; color: #2d6a4f; line-height: 1.5;">
                                        🌱 <strong>Keep your account safe</strong> — never share your OTP with anyone, including FarmGoo support staff.
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
                            <td align="center" style="padding: 25px; background-color: #f0faf4; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0; color: #52b788;">🌾 Growing together, one harvest at a time.</p>
                                <p style="margin: 8px 0 0;">&copy; 2026 FarmGoo App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #2d6a4f; text-decoration: none;">Security Settings</a> &bull;
                                    <a href="#" style="color: #2d6a4f; text-decoration: none;">Contact Support</a>
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

exports.resendOtpTemplateForFarmers = (name, otp) => {
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
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                                <p style="margin: 0 0 6px; font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1.5px;">Farmer Portal</p>
                                <h1 style="margin: 0; color: #00d2ff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">FarmGoo</h1>
                            </td>
                        </tr>

                        <!-- OTP Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">

                                <!-- Icon -->
                                <div style="margin-bottom: 20px; font-size: 50px;">🔄</div>

                                <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #1a1a1a;">Here's Your New OTP</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi <strong>${name}</strong>, you requested a new verification code. Your previous OTP has been invalidated — use the one below to verify your email.
                                </p>

                                <!-- OTP Box -->
                                <div style="display: inline-block; background-color: #f0fbff; border: 2px dashed #00d2ff; border-radius: 12px; padding: 20px 40px; margin-bottom: 30px;">
                                    <p style="margin: 0 0 6px; font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Your New One-Time Password</p>
                                    <p class="otp-box" style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 14px; color: #00d2ff;">${otp}</p>
                                </div>

                                <p style="font-size: 14px; color: #999999; margin: 0 0 10px;">This OTP expires in <strong style="color: #1a1a1a;">10 minutes</strong>.</p>

                                <!-- Resend note -->
                                <p style="font-size: 14px; color: #666666; margin: 20px 0 0; background-color: #fff8f0; border-left: 3px solid #f0a500; padding: 12px 16px; border-radius: 6px; text-align: left;">
                                    ⚠️ If you didn't request a new code, your account may be at risk. Please <a href="#" style="color: #00d2ff; text-decoration: none;">contact support</a> immediately.
                                </p>

                                <!-- Warning -->
                                <p style="font-size: 13px; color: #999999; margin-top: 30px; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    <strong>Didn't request this?</strong> You can safely ignore this email. Your account remains secure until this code is used.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #fafafa; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0;">&copy; 2026 FarmGoo App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Security Settings</a> &bull;
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Contact Support</a>
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