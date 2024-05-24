import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema(
    {
        _id: false,
        txnId: { type: String, required: true },
        txnType: { type: String, required: true},
        name: { type: String, required: true },
        accountNumber: { type: String },
        iban: { type: String},
        amount: { type: Number },
        currency: { type: String }
    },
    {
        timestamps: { createdAt: true, updatedAt: false } 
    }
)

export default transactionSchema;