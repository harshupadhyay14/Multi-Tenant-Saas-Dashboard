const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");
const { protect, superAdminOnly, requireOrgRole } = require("../middleware/auth");

router.use(protect);

// ── GET /api/organizations (super_admin: all orgs) ────────────────────────────
router.get("/", superAdminOnly, async (req, res) => {
  try {
    const orgs = await Organization.find().sort("-createdAt").populate("ownerId", "name email");
    res.json({ success: true, count: orgs.length, orgs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── GET /api/organizations/mine ───────────────────────────────────────────────
// Get all orgs the current user belongs to
router.get("/mine", async (req, res) => {
  const orgIds = req.user.memberships.map((m) => m.orgId);
  const orgs = await Organization.find({ _id: { $in: orgIds } });
  res.json({ success: true, orgs });
});

// ── GET /api/organizations/:orgId ─────────────────────────────────────────────
router.get("/:orgId", requireOrgRole("org_admin", "member", "viewer"), async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId).populate("ownerId", "name email");
    if (!org) return res.status(404).json({ success: false, message: "Org not found" });
    res.json({ success: true, org });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── PATCH /api/organizations/:orgId ──────────────────────────────────────────
// Update org (org_admin or super_admin)
router.patch("/:orgId", requireOrgRole("org_admin"), async (req, res) => {
  const { name, plan, status } = req.body;

  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ success: false, message: "Org not found" });

    if (name) org.name = name;
    // Plan/status changes restricted to super_admin
    if (req.user.systemRole === "super_admin") {
      if (plan) org.plan = plan;
      if (status) org.status = status;
    }

    await org.save();
    res.json({ success: true, org });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── DELETE /api/organizations/:orgId (super_admin only) ───────────────────────
router.delete("/:orgId", superAdminOnly, async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.orgId);
    res.json({ success: true, message: "Organization deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
