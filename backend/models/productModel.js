import mongoose from 'mongoose';

const addressSchema = mongoose.Schema(
    {
        addressLine: [String],
        postCode: String,
        country: String
    },
    { _id : false }
)

const creditCardSchema = mongoose.Schema(
    {
        referenceId: { type: Number, required: true, unique: true},
        delivery: { type: String, required: true },
        address: { type: addressSchema},
        status: {type: String, default: 'pending'}
    }
);

const CreditCardModel = mongoose.model('CreditCard', creditCardSchema);

export {
    CreditCardModel
} ;