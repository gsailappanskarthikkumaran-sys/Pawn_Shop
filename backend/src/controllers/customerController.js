import Customer from '../models/Customer.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const cleanupFiles = (files) => {
    if (!files) return;
    Object.values(files).forEach(fileArray => {
        fileArray.forEach(file => {
            try {
                fs.unlinkSync(file.path);
            } catch (err) {
                console.error("Failed to delete file:", file.path, err);
            }
        });
    });
};

const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, aadharNumber, panNumber, fatherName, dob, gender, maritalStatus, nominee, city, pincode, state } = req.body;

        const orConditions = [{ phone }];
        if (email) {
            orConditions.push({ email });
        }

        const customerExists = await Customer.findOne({ $or: orConditions });
        if (customerExists) {
            cleanupFiles(req.files);
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

        let branchToAssign = req.user.branch;

        if (req.user.role === 'admin') {
            branchToAssign = req.body.branch;
            if (!branchToAssign) {
                cleanupFiles(req.files);
                return res.status(400).json({ message: 'Admin must select a branch for the customer' });
            }
        }

        if (req.user.role === 'staff' && !branchToAssign) {
            cleanupFiles(req.files);
            return res.status(400).json({ message: 'Staff user is not assigned to any branch. Contact Admin.' });
        }

        if (!branchToAssign) {

            cleanupFiles(req.files);
            return res.status(400).json({ message: 'Branch assignment failed' });
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
            createdBy: req.user._id,
            branch: branchToAssign,
            fatherName,
            dob,
            gender,
            maritalStatus,
            nominee,
            city,
            pincode,
            state
        });

        res.status(201).json(customer);

    } catch (error) {
        cleanupFiles(req.files);

        res.status(400).json({ message: 'Invalid customer data', error: error.message });
    }
};


const getCustomers = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'staff' && req.user.branch) {
            query.branch = req.user.branch;
        } else if (req.query.branch) {
            query.branch = req.query.branch;
        }

        const customers = await Customer.find(query).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {

            if (req.user.role === 'staff' && req.user.branch) {

                if (!customer.branch || customer.branch.toString() !== req.user.branch.toString()) {
                    return res.status(403).json({ message: 'Not authorized to view this customer' });
                }
            }
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { name, phone, address, email, aadharNumber, panNumber, fatherName, dob, gender, maritalStatus, nominee, city, pincode, state } = req.body;
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        customer.name = name || customer.name;
        customer.phone = phone || customer.phone;
        customer.address = address || customer.address;
        customer.email = email || customer.email;
        customer.aadharNumber = aadharNumber || customer.aadharNumber;
        customer.aadharNumber = aadharNumber || customer.aadharNumber;
        customer.panNumber = panNumber || customer.panNumber;
        customer.fatherName = fatherName || customer.fatherName;
        customer.dob = dob || customer.dob;
        customer.gender = gender || customer.gender;
        customer.maritalStatus = maritalStatus || customer.maritalStatus;
        customer.nominee = nominee || customer.nominee;
        customer.city = city || customer.city;
        customer.pincode = pincode || customer.pincode;
        customer.state = state || customer.state;

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