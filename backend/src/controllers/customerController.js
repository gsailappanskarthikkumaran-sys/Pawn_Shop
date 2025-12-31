
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
