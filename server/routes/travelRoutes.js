const express = require("express");
const axios = require("axios");

const router = express.Router();

// GET /api/travel-options?from=<location>&to=<location>
router.get("/travel-options", async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "Both 'from' and 'to' parameters are required" });
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ message: "Google API key not configured" });
    }

    // Step 1: Geocode both locations to get coordinates and country
    const geocodeUrl = (location) =>
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_API_KEY}`;

    const [fromGeocode, toGeocode] = await Promise.all([
      axios.get(geocodeUrl(from)),
      axios.get(geocodeUrl(to)),
    ]);

    if (fromGeocode.data.status !== "OK" || !fromGeocode.data.results[0]) {
      return res.status(400).json({ message: `Could not find location: ${from}` });
    }

    if (toGeocode.data.status !== "OK" || !toGeocode.data.results[0]) {
      return res.status(400).json({ message: `Could not find location: ${to}` });
    }

    const fromLocation = fromGeocode.data.results[0];
    const toLocation = toGeocode.data.results[0];

    // Extract country from address components
    const getCountry = (location) => {
      const countryComponent = location.address_components.find((component) =>
        component.types.includes("country")
      );
      return countryComponent ? countryComponent.short_name : null;
    };

    const fromCountry = getCountry(fromLocation);
    const toCountry = getCountry(toLocation);
    const isInternational = fromCountry !== toCountry;

    const fromCoords = fromLocation.geometry.location;
    const toCoords = toLocation.geometry.location;

    // Step 2: Calculate distance using Distance Matrix API
    const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromCoords.lat},${fromCoords.lng}&destinations=${toCoords.lat},${toCoords.lng}&key=${GOOGLE_API_KEY}`;

    const distanceResponse = await axios.get(distanceMatrixUrl);

    if (distanceResponse.data.status !== "OK") {
      return res.status(500).json({ message: "Failed to calculate distance" });
    }

    const element = distanceResponse.data.rows[0].elements[0];
    if (element.status !== "OK") {
      return res.status(400).json({ message: "Could not calculate route between locations" });
    }

    const distanceKm = element.distance.value / 1000; // Convert meters to km
    const durationSeconds = element.duration.value;

    // Step 3: Determine available travel modes
    const availableModes = isInternational
      ? ["Flight", "Ship"]
      : ["Flight", "Train", "Bus", "Car"];

    // Step 4: Calculate prices and durations
    const rates = { flight: 6, train: 1.5, bus: 1.2, car: 4, ship: 0.8 };

    const calculateDuration = (mode, distance) => {
      const speeds = {
        flight: 750, // km/h
        train: 120,
        bus: 70,
        car: 80,
        ship: 30,
      };
      const baseTime = distance / speeds[mode];
      const overhead = {
        flight: 2.5, // hours (airport procedures)
        train: 0.5,
        bus: 0.3,
        car: 0,
        ship: 0,
      };
      return baseTime + overhead[mode];
    };

    const formatDuration = (hours) => {
      if (hours < 24) {
        return `${Math.round(hours)}h`;
      }
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      if (remainingHours === 0) {
        return `${days} day${days > 1 ? "s" : ""}`;
      }
      return `${days} day${days > 1 ? "s" : ""} ${remainingHours}h`;
    };

    const options = availableModes.map((mode) => {
      const modeLower = mode.toLowerCase();
      const price = Math.round(distanceKm * rates[modeLower]);
      const durationHours = calculateDuration(modeLower, distanceKm);
      const duration = formatDuration(durationHours);

      return {
        mode,
        price,
        duration,
      };
    });

    // Response format
    const response = {
      from: fromLocation.formatted_address || from,
      to: toLocation.formatted_address || to,
      distance_km: Math.round(distanceKm),
      isInternational,
      options,
    };

    return res.json(response);
  } catch (error) {
    console.error("Error in travel-options route:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

