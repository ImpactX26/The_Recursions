const express = require("express");
const crypto = require("crypto");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const workerPassports = [
  {
    workerId: "worker-001",
    verifiedSkills: ["Electrical Repair", "Wiring"],
    cooperativeMembership: "Registered",
    eShramStatus: "Verified",
  },
];

router.get(
  "/:id/passport",
  authMiddleware,
  roleMiddleware("worker", "admin"),
  (req, res) => {
    const worker = workerPassports.find(
      (worker) => worker.workerId === req.params.id,
    );

    if (!worker) {
      return res.status(404).json({
        message: "Worker passport not found",
      });
    }

    const canonicalData = `${worker.workerId}|${worker.verifiedSkills
      .slice()
      .sort()
      .join("|")}`;

    const credentialHash = crypto
      .createHash("sha256")
      .update(canonicalData)
      .digest("hex");

    res.json({
      workerId: worker.workerId,
      verifiedSkills: worker.verifiedSkills,
      cooperativeMembership: worker.cooperativeMembership,
      eShramStatus: worker.eShramStatus,
      credential_hash: credentialHash,
    });
  },
);
const workerAvailability = {};

router.patch(
  "/:id/availability",
  authMiddleware,
  roleMiddleware("worker"),
  (req, res) => {
    const { online } = req.body;

    if (typeof online !== "boolean") {
      return res.status(400).json({
        message: "online must be true or false",
      });
    }

    workerAvailability[req.params.id] = online;

    res.json({
      message: "Availability updated successfully",
      workerId: req.params.id,
      online: online,
    });
  },
);
module.exports = router;
