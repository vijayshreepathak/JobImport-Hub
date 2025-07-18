import mongoose from "mongoose";

const importLogSchema = new mongoose.Schema(
  {
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    total: { type: Number, default: 0 },
    newCount: { type: Number, default: 0 },
    updatedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    fileName: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("ImportLog", importLogSchema);
