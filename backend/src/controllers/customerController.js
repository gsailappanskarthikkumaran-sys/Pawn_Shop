import Customer from '../models/Customer.js';
import { v4 as uuidv4 } from 'uuid';

const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, aadharNumber, panNumber } = req.body;

        const customerExists = await Customer.findOne({ $or: [{ phone }, { email }] });
        if (customerExists) {
            return res.status(400).json({ message: 'Customer already exists with this phone or email' });
        }

        let photoPath = '';
        let aadharCardPath = '';
        let panCardPath = '';

        if (req.files) {
            if (req.files['photo']) {
                photoPath = req.files['photo'][0].path.replace(/\\/g, "/");
            }
            if (req.files['aadharCard']) {
                aadharCardPath = req.files['aadharCard'][0].path.replace(/\\/g, "/");
            }
            if (req.files['panCard']) {
                panCardPath = req.files['panCard'][0].path.replace(/\\/g, "/");
            }
        }

        const customer = await Customer.create({
            customerId: `CUST-${uuidv4().substring(0, 8).toUpperCase()}`,
            name,
            email,
            phone,
            address,
            aadharNumber,
            panNumber,
            photo: photoPath,
            aadharCard: aadharCardPath,
            panCard: panCardPath,
            createdBy: req.user._id
        });

        res.status(201).json(customer);

    } catch (error) {
        res.status(400).json({ message: 'Invalid customer data', error: error.message });
    }
};


const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({}).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


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

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
    try {
        const { name, phone, address, email, aadharNumber, panNumber } = req.body;
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Update fields
        customer.name = name || customer.name;
        customer.phone = phone || customer.phone;
        customer.address = address || customer.address;
        customer.email = email || customer.email;
        customer.aadharNumber = aadharNumber || customer.aadharNumber;
        customer.panNumber = panNumber || customer.panNumber;

        // Update files if provided
        if (req.files) {
            if (req.files['photo']) customer.photo = req.files['photo'][0].path.replace(/\\/g, "/");
            if (req.files['aadharCard']) customer.aadharCard = req.files['aadharCard'][0].path.replace(/\\/g, "/");
            if (req.files['panCard']) customer.panCard = req.files['panCard'][0].path.replace(/\\/g, "/");
        }

        const updatedCustomer = await customer.save();
        res.json(updatedCustomer);

    } catch (error) {
        res.status(400).json({ message: 'Error updating customer', error: error.message });
    }
};

export { createCustomer, getCustomers, getCustomerById, updateCustomer };
