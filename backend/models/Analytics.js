const mongoose = require("mongoose");

// Stores monthly aggregated analytics per org
const analyticsSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    period: { type: String, required: true }, // e.g. "2024-03"
    metrics: {
      sessions: { type: Number, default: 0 },
      pageViews: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      newSignups: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }, // USD cents
      avgSessionDuration: { type: Number, default: 0 }, // seconds
    },
  },
  { timestamps: true }
);

analyticsSchema.index({ orgId: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("Analytics", analyticsSchema);
