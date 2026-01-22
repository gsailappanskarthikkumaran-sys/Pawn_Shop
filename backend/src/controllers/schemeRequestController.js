import SchemeRequest from '../models/SchemeRequest.js';
import { notifyAdminsAndStaff } from '../services/notificationService.js';

const createRequest = async (req, res) => {
    try {
        const { customerId, originalSchemeId, proposedValues, reason } = req.body;

        if (!customerId || !originalSchemeId || !proposedValues || !reason) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const request = await SchemeRequest.create({
            staffId: req.user._id,
            customerId,
            branch: req.user.branch,
            originalSchemeId,
            proposedValues,
            reason,
            status: 'pending'
        });

        // Notify Admins
        await notifyAdminsAndStaff({
            title: 'New Scheme Customization Request',
            message: `Staff ${req.user.fullName} requested scheme customization for a customer.`,
            type: 'warning',
            branch: null, // Global notification for admins
            referenceId: request._id,
            referenceType: 'SchemeRequest'
        });

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getRequests = async (req, res) => {
    try {
        let query = {};

        // If staff, only see their own requests or branch specific (here just own)
        if (req.user.role === 'staff') {
            query.staffId = req.user._id;
        } else {
            // Admin sees all pending by default, or filtered
            if (req.query.status) query.status = req.query.status;
        }

        const requests = await SchemeRequest.find(query)
            .populate('staffId', 'fullName')
            .populate('customerId', 'name customerId')
            .populate('originalSchemeId', 'schemeName')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminComment } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await SchemeRequest.findById(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        request.reviewedBy = req.user._id;
        request.adminComment = adminComment || '';

        await request.save();

        // Notify the staff member who made the request
        /* 
           Ideally we would use a more targeted notification system, 
           but re-using notifyAdminsAndStaff with the specific branch 
           ensure the staff member (and their colleagues) see it.
        */
        await notifyAdminsAndStaff({
            title: `Scheme Request ${status.toUpperCase()}`,
            message: `Request for customer customization has been ${status}.`,
            type: status === 'approved' ? 'success' : 'error',
            branch: request.branch,
            referenceId: request._id,
            referenceType: 'SchemeRequest'
        });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Check for an approved request for a specific customer (helper for UI)
const checkActiveRequest = async (req, res) => {
    try {
        const { customerId, schemeId } = req.query;
        // Find the latest APPROVED request for this customer/scheme combo
        // Or just any valid approved request for this customer that hasn't been "used" yet?
        // For simplicity, let's just find the most recent approved one.

        const request = await SchemeRequest.findOne({
            customerId,
            originalSchemeId: schemeId,
            status: 'approved'
        }).sort({ createdAt: -1 });

        res.json(request || null);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { createRequest, getRequests, updateRequestStatus, checkActiveRequest };
