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
        applicationId: { type: Number, required: true, unique: true},
        deliveryMethod: { type: String, required: true },
        postalAddress: { type: addressSchema},
        applicationStatus: {type: String, default: 'pending'}
    }
);

const CreditCardModel = mongoose.model('CreditCard', creditCardSchema);

export {
    CreditCardModel
} ;