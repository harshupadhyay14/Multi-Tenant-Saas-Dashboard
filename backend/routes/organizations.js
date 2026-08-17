const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");
const { protect, superAdminOnly, requireOrgRole } = require("../middleware/auth");
const { getPresignedUploadUrl } = require("../config/s3");

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

// ── POST /api/organizations/:orgId/logo-upload-url ────────────────────────────
// Returns a short-lived presigned S3 URL. The browser PUTs the file directly
// to S3 with it, then calls the PATCH below with the resulting object key.
router.post("/:orgId/logo-upload-url", requireOrgRole("org_admin"), async (req, res) => {
  const { contentType } = req.body; // e.g. "image/png"
  if (!contentType?.startsWith("image/")) {
    return res.status(400).json({ success: false, message: "contentType must be an image type" });
  }

  try {
    const key = `org-logos/${req.params.orgId}/${Date.now()}-logo`;
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);
    res.json({ success: true, uploadUrl, publicUrl, key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not generate upload URL" });
  }
});

// ── PATCH /api/organizations/:orgId/logo ──────────────────────────────────────
// Called after the browser finishes the direct S3 PUT, to save the URL.
router.patch("/:orgId/logo", requireOrgRole("org_admin"), async (req, res) => {
  const { logoUrl } = req.body;
  if (!logoUrl) return res.status(400).json({ success: false, message: "logoUrl required" });

  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.orgId,
      { logoUrl },
      { new: true }
    );
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