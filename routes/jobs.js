const express = require("express");
const { calculateFeeSplit } = require("../services/feeSplit");

const router = express.Router();

router.post("/create", (req, res) => {
    const {
        title,
        description,
        amount,
        location,
        skills
    } = req.body;

    const feeSplit = calculateFeeSplit(amount);

    const job = {
        id: Date.now(),
        title,
        description,
        amount,
        location,
        skills,
        platformFee: feeSplit.platformFee,
        workerAmount: feeSplit.workerAmount,
        status: "open"
    };

    res.status(201).json({
        message: "Job created successfully",
        job
    });
});

module.exports = router;