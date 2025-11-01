const express = require("express");
const Trip = require("../models/Trip");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all routes below
router.use(auth);

// POST /api/trips/save
router.post("/save", async (req, res) => {
  try {
    const { destination, coordinates, originCoordinates, destinations: multiDestinations, tripType, startDate, endDate, weatherSummary, route, totalTime, totalCost, totalCO2 } = req.body;
    
    // Support both single destination and multi-destination trips
    const tripData = {
      userId: req.user.id,
      tripType,
      startDate,
      endDate,
    };

    // If multi-destinations provided, use that; otherwise fall back to single destination
    if (multiDestinations && Array.isArray(multiDestinations) && multiDestinations.length > 0) {
      tripData.destinations = multiDestinations;
      tripData.route = route;
      tripData.totalTime = totalTime;
      tripData.totalCost = totalCost;
      tripData.totalCO2 = totalCO2;
    } else if (destination) {
      tripData.destination = destination;
      tripData.coordinates = coordinates;
      tripData.originCoordinates = originCoordinates;
      tripData.weatherSummary = weatherSummary;
    } else {
      return res.status(400).json({ message: "destination or destinations array is required" });
    }

    if (!tripData.tripType || !tripData.startDate || !tripData.endDate) {
      return res.status(400).json({ message: "tripType, startDate, endDate are required" });
    }

    const trip = await Trip.create(tripData);
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


