const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    plan: {
      type: String,
      enum: ["starter", "pro", "enterprise"],
      default: "starter",
    },
    status: {
      type: String,
      enum: ["active", "trial", "suspended", "cancelled"],
      default: "trial",
    },
    trialEndsAt: { type: Date },
    mrr: { type: Number, default: 0 }, // monthly recurring revenue in USD
    settings: {
      maxUsers: { type: Number, default: 5 },
      allowedDomains: [String],
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-generate slug from name
organizationSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  next();
});

module.exports = mongoose.model("Organization", organizationSchema);
