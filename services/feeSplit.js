function calculateFeeSplit(amount) {
    const platformFee = amount * 0.10;
    const workerAmount = amount - platformFee;

    return {
        totalAmount: amount,
        platformFee: platformFee,
        workerAmount: workerAmount
    };
}

module.exports = {
    calculateFeeSplit
};