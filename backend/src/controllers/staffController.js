import User from '../models/User.js';

const getAllStaff = async (req, res) => {
    try {
        const query = { role: 'staff' };
        if (req.query.branch) {
            query.branch = req.query.branch;
        }
        const staff = await User.find(query).select('-password').populate('branch', 'name');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};



const addStaff = async (req, res) => {
    const { fullName, address, phoneNumber, idProofNumber, branch, email, username, password } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User with this username already exists' });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = await User.create({
            username,
            password,
            fullName,
            address,
            phoneNumber,
            idProofNumber,
            branch,
            email,
            role: 'staff'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                branch: user.branch
            });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid user data', error: error.message });
    }
};


const updateStaff = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.fullName = req.body.fullName || user.fullName;
        user.address = req.body.address || user.address;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.idProofNumber = req.body.idProofNumber || user.idProofNumber;
        user.branch = req.body.branch || user.branch;
        user.email = req.body.email || user.email;

        if (req.body.username) user.username = req.body.username;
        if (req.body.password) user.password = req.body.password;

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
