import Branch from '../models/Branch.js';
const getBranches = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'staff' && req.user.branch) {
            query._id = req.user.branch;
        } else if (req.user.role === 'staff' && !req.user.branch) {

            return res.json([]);
        }

        const branches = await Branch.find(query);
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getBranchById = async (req, res) => {
    try {

        if (req.user.role === 'staff') {
            if (!req.user.branch || req.user.branch.toString() !== req.params.id) {
                return res.status(403).json({ message: 'Not authorized to view this branch' });
            }
        }

        const branch = await Branch.findById(req.params.id);
        if (branch) {
            res.json(branch);
        } else {
            res.status(404).json({ message: 'Branch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const addBranch = async (req, res) => {
    const { branchId, name, address } = req.body;

    try {
        const branchExists = await Branch.find({ name, branchId });

        if (branchExists) {
            return res.status(400).json({ message: 'Branch already exists' });
        }

        const branch = await Branch.create({
            branchId,
            name,
            address,
        });

        res.status(201).json(branch);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);

        if (branch) {
            await branch.deleteOne();
            res.json({ message: 'Branch removed' });
        } else {
            res.status(404).json({ message: 'Branch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getBranches, getBranchById, addBranch, deleteBranch };
