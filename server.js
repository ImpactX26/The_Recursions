const express = require("express");
const cors = require("cors");
const jobsRouter = require("./routes/jobs");
const { calculateFeeSplit } = require("./services/feeSplit");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/jobs", jobsRouter);

app.get("/", (req, res) => {
    res.json({
        message: "Gig Service Backend is running"
    });
});

app.get("/fee-split/:amount", (req, res) => {
    const amount = Number(req.params.amount);

    const result = calculateFeeSplit(amount);

    res.json(result);
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});