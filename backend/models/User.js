const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    // Global platform role — only Anthropic/platform staff get super_admin
    systemRole: {
      type: String,
      enum: ["super_admin", "user"],
      default: "user",
    },
    avatar: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    // Memberships: one user can belong to multiple orgs with different roles
    memberships: [
      {
        orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
        role: {
          type: String,
          enum: ["org_admin", "member", "viewer"],
          default: "member",
        },
        status: {
          type: String,
          enum: ["active", "invited", "suspended"],
          default: "active",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user's role in a specific org
userSchema.methods.getRoleInOrg = function (orgId) {
  const membership = this.memberships.find(
    (m) => m.orgId.toString() === orgId.toString()
  );
  return membership ? membership.role : null;
};

// Virtual: Is super admin?
userSchema.virtual("isSuperAdmin").get(function () {
  return this.systemRole === "super_admin";
});

module.exports = mongoose.model("User", userSchema);
