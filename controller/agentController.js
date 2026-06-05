const agentModel = require('../model/agent')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')

exports.createAgent = async (req, res, next) => {
    try {

        const { firstName, lastName, phoneNumber, email, townOrVillage, password } = req.body;

        const existingEmail = await agentModel.findOne({ email });

        if (existingEmail) {
            return next({
                message: 'Email already exists',
                statusCode: 400
            })
        }

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const agent = new agentModel({
            firstName,
            lastName,
            phoneNumber,
            email,
            townOrVillage,
            password: hashedPassword,
            otp,
            otpExpiresAt: expiresAt
        });

        await agent.save();
        res.status(201).json({
            message: 'Agent created successfully',
            data: agent
        });
    } catch (error) {
        console.error(error);
        next({
            message: 'Something went wrong',
            statusCode: 500
        });
    }
}

exports.loginAgent = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const agent = await agentModel.findOne({ email });
        if (!agent) {
            return next({
                message: 'Invalid email or password',
                statusCode: 401
            });
        }
        const isPasswordValid = await bcrypt.compare(password, agent.password);
        if (!isPasswordValid) {
            return next({
                message: 'Invalid email or password',
                statusCode: 401
            });
        }   
        const token = jwt.sign({ id: agent._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token,
            agent
        });
    } catch (error) {
        console.error(error);
        next({
            message: 'Something went wrong',
            statusCode: 500
        });
    }
}