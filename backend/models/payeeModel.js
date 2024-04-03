import mongoose from 'mongoose';

const payeeSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        utility: { type: String },
        account: { type: String },
        iban: { type: String }
    }
);

export default payeeSchema;