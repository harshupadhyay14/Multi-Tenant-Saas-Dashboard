const express = require("express");
const router = express.Router();
const Analytics = require("../models/Analytics");
const { protect, requireOrgRole } = require("../middleware/auth");

router.use(protect);

// ── GET /api/analytics/org/:orgId?months=6 ────────────────────────────────────
router.get("/org/:orgId", requireOrgRole("org_admin", "member"), async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const now = new Date();

    // Build array of "YYYY-MM" strings for the last N months
    const periods = Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }).reverse();

    const records = await Analytics.find({
      orgId: req.params.orgId,
      period: { $in: periods },
    }).sort("period");

    // Fill in zeros for missing months
    const dataMap = {};
    records.forEach((r) => (dataMap[r.period] = r.metrics));
    const data = periods.map((p) => ({
      period: p,
      ...(dataMap[p] || { sessions: 0, pageViews: 0, activeUsers: 0, newSignups: 0, revenue: 0 }),
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── POST /api/analytics/track ─────────────────────────────────────────────────
// Upsert analytics for current month (called by your app backend or cron job)
router.post("/track", requireOrgRole("org_admin"), async (req, res) => {
  const { orgId, metrics } = req.body;
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    const record = await Analytics.findOneAndUpdate(
      { orgId, period },
      { $inc: metrics },
      { upsert: true, new: true }
    );
    res.json({ success: true, record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
