import Customer from '../models/Customer.js';

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
    try {
        const { name, phone, address, email } = req.body;
        let { customerId } = req.body;

        if (!customerId) {
            customerId = `CUST-${Date.now()}`; // Auto-generate if missing
        }

        // File paths
        const photo = req.files && req.files['photo'] ? req.files['photo'][0].path.replace(/\\/g, "/") : null;
        const idProof = req.files && req.files['idProof'] ? req.files['idProof'][0].path.replace(/\\/g, "/") : null;

        const customer = await Customer.create({
            customerId,
            name,
            email,
            phone,
            address,
            photo,
            idProof,
            createdBy: req.user._id
        });

        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: 'Error creating customer', error: error.message });
    }
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        } : {};

        const customers = await Customer.find({ ...keyword });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { createCustomer, getCustomers, getCustomerById };
