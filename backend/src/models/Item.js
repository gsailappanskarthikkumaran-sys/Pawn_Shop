import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true,
    },
    name: {
        type: String, // e.g., "Gold Ring", "Necklace"
        required: true,
    },
    description: {
        type: String,
    },
    netWeight: {
        type: Number, // in grams
        required: true,
    },
    purity: {
        type: String, // e.g., "22k", "24k"
        required: true,
    },
    photos: [{
        type: String, // Paths to uploaded images
    }]
}, {
    timestamps: true,
});

const Item = mongoose.model('Item', itemSchema);

export default Item;
