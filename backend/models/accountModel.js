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
    { _id: false }
)

const productSchema = mongoose.Schema(
    {
        type: String,
        referenceId: Number
    }
)

const accountSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        socialMedia: { type: String, default: '' },
        postalAddress: {
            type: addressSchema
        },
        pan: { type: String, required: true },
        balance: { type: Number, default: 1000 },
        currency: { type: String, default: "EUR" },
        options: {
            paperStatements: { type: Boolean, default: false },
            cardActivityAlerts: { type: Boolean, default: true },
            smsNotifications: { type: Boolean, default: false },
            accountType: { type: String, enum: ['Personal', 'Business'], default: 'Personal' }
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

// Store the account PAN as a hash
accountSchema.pre('save', async function (next) {

    if (!this.isModified('pan')) {
        next();
    }
    const salt = await bcrypt.genSalt(8);
    this.pan = await bcrypt.hash(this.pan, salt);
});

// Validate the received PAN against the stored PAN
accountSchema.methods.validatePan = async function (pan) {

    return await bcrypt.compare(pan, this.pan)
}

const AccountModel = mongoose.model('Account', accountSchema);

export default AccountModel;