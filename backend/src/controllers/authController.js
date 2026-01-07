import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        if (!user.isActive) {
            return res.status(401).json({ message: 'User is inactive' });
        }

        res.json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

const registerUser = async (req, res) => {
    const { username, password, fullName, role } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        username,
        password,
        fullName,
        role,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

export { loginUser, registerUser };
