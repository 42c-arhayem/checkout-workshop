import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema(
    {
        _id: false,
        txnId: { type: String },
        payer: { type: String, required: true },
        payee: { type: String, required: true },
        amount: { type: Number },
        currency: { type: String }
    },
    {
        timestamps: { createdAt: true, updatedAt: false } 
    }
)

export default transactionSchema;