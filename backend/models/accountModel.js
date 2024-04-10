import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import payeeSchema from './payeeModel.js';
import transactionSchema from './transactionModel.js';

const addressSchema = mongoose.Schema(
    {
        addressLine: [String],
        postCode: String,
        country: String
    },
    { _id : false }
)

const productSchema = mongoose.Schema(
    {
        productType: String,
        referenceId: Number
    }
)

const accountSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        postalAddress: {
            type: addressSchema
        },
        pin: { type: String, required: true },
        balance: {
            amount: { type: Number, default: 1000 },
            currency: { type: String, default: "EUR" }
        },
        payees: {
            type: [payeeSchema]
        },
        transactions: {
            type: [transactionSchema]
        },
        products: {
            type: [productSchema]
        }
    },
    {
        timestamps: true
    }
);

// Store the account PIN as a hash
accountSchema.pre('save', async function(next) {
    
    if(!this.isModified('pin')) {
        next();
    }
    const salt = await bcrypt.genSalt(8);
    this.pin = await bcrypt.hash(this.pin, salt);
});

// Validate the received PIN against the stored PIN
accountSchema.methods.validatePin = async function(pin) {

    return await bcrypt.compare(pin, this.pin)
}

const AccountModel = mongoose.model('Account', accountSchema);

export default AccountModel;