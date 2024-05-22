import mongoose from 'mongoose';

const payeeSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        payeeType: { type: String, required: true },
        utility: { type: String },
        accountNumber: { type: String },
        iban: { type: String }
    }
);

export default payeeSchema;