import mongoose from 'mongoose';

const creditCardSchema = mongoose.Schema(
    {
        _id: { type: Number },
        name: { type: String, required: true},
        delivery: { type: String, required: true },
        address: {
            addressLine: [String],
            postCode: String,
            country: String
        },
        status: { type: String, default: 'pending' }
    }
);

const CreditCardModel = mongoose.model('CreditCard', creditCardSchema);

export default CreditCardModel;