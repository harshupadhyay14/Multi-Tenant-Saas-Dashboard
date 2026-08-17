// One-off script: seeds 6 months of realistic analytics data for a demo org.
// Run locally with: node scripts/seedAnalytics.js
// Safe to run multiple times — it upserts (overwrites), doesn't duplicate.

require("dotenv").config();
const mongoose = require("mongoose");
const Analytics = require("../models/Analytics");

const ORG_ID = "6a817d6e9782c5102a397aaf"; // Test Org — replace if seeding a different org

// Roughly increasing trend, current month included so the line doesn't dip.
// Live dashboard visits between now and the demo will $inc on top of this,
// so real usage only pushes the current-month number further up.
const MONTHLY_DATA = [
  { monthsAgo: 5, sessions: 42,  pageViews: 118, activeUsers: 6,  newSignups: 2, revenue: 40000  },
  { monthsAgo: 4, sessions: 67,  pageViews: 201, activeUsers: 9,  newSignups: 3, revenue: 90000  },
  { monthsAgo: 3, sessions: 95,  pageViews: 289, activeUsers: 13, newSignups: 2, revenue: 140000 },
  { monthsAgo: 2, sessions: 134, pageViews: 402, activeUsers: 17, newSignups: 4, revenue: 190000 },
  { monthsAgo: 1, sessions: 178, pageViews: 511, activeUsers: 21, newSignups: 5, revenue: 240000 },
  { monthsAgo: 0, sessions: 190, pageViews: 545, activeUsers: 23, newSignups: 3, revenue: 255000 },
];

function periodFor(monthsAgo) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  for (const row of MONTHLY_DATA) {
    const period = periodFor(row.monthsAgo);
    await Analytics.findOneAndUpdate(
      { orgId: ORG_ID, period },
      {
        $set: {
          metrics: {
            sessions: row.sessions,
            pageViews: row.pageViews,
            activeUsers: row.activeUsers,
            newSignups: row.newSignups,
            revenue: row.revenue,
            avgSessionDuration: 210,
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log(`Seeded ${period}: sessions=${row.sessions}, revenue=$${row.revenue / 100}`);
  }

  console.log("Done. Current month untouched — your real dashboard visits will populate it.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});