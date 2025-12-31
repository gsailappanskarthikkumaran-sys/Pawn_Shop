import User from '../models/User.js';

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
const getAllStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: 'staff' }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add new staff
// @route   POST /api/staff
// @access  Private/Admin
const addStaff = async (req, res) => {
    const { username, password, fullName } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User/ID already exists' });
        }

        const user = await User.create({
            username,
            password,
            fullName,
            role: 'staff'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid user data', error: error.message });
    }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.fullName = req.body.fullName || user.fullName;
        user.username = req.body.username || user.username;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            fullName: updatedUser.fullName,
            role: updatedUser.role
        });

    } catch (error) {
        res.status(400).json({ message: 'Error updating staff', error: error.message });
    }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });

        await user.deleteOne();
        res.json({ message: 'Staff removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getAllStaff, addStaff, updateStaff, deleteStaff };
