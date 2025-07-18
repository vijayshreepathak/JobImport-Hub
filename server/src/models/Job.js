import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    external_id: { type: String, required: true },
    source: { type: String, required: true },
    title: String,
    description: String,
    url: String,
    company: String,
    location: String,
    postedAt: Date,
    raw: Object
  },
  { timestamps: true }
);

jobSchema.index({ external_id: 1, source: 1 }, { unique: true });

export default mongoose.model("Job", jobSchema);
