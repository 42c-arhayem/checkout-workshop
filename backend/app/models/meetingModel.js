import mongoose from 'mongoose';

const meetingPlannerSchema = mongoose.Schema(
    {
        subject: { type: String, required: true, enum: ['Savings', 'Investment', 'Mortgage'], default: 'Mortgage' },
        schedule: { type: Date, required: true },
        accountId: { type: String, required: true},
    }
);

const MeetingPlannerModel = mongoose.model('Consultation', meetingPlannerSchema);

export default MeetingPlannerModel;