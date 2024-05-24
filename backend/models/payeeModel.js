import mongoose from 'mongoose';

const payeeSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        account: { type: String, required: true },
        payeeType: { type: String, required: true } 
    }
);

export default payeeSchema;