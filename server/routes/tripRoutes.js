const express = require("express");
const Trip = require("../models/Trip");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all routes below
router.use(auth);

// POST /api/trips/save
router.post("/save", async (req, res) => {
  try {
    const { destination, coordinates, tripType, startDate, endDate, weatherSummary } = req.body;
    if (!destination || !tripType || !startDate || !endDate) {
      return res.status(400).json({ message: "destination, tripType, startDate, endDate are required" });
    }

    const trip = await Trip.create({
      userId: req.user.id,
      destination,
      coordinates,
      tripType,
      startDate,
      endDate,
      weatherSummary,
    });
    return res.status(201).json(trip);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/trips/user/:id
router.get("/user/:id", async (req, res) => {
  try {
    if (req.params.id !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(trips);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/trips/:id
router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    await trip.deleteOne();
    return res.json({ message: "Trip deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;


