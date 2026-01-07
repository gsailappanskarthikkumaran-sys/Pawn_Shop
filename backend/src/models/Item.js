import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    netWeight: {
        type: Number,
        required: true,
    },
    purity: {
        type: String,
        required: true,
    },
    photos: [{
        type: String,
    }]
}, {
    timestamps: true,
});

const Item = mongoose.model('Item', itemSchema);

export default Item;
