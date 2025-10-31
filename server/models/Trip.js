const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true, trim: true },
    coordinates: {
      lat: { type: Number },
      lon: { type: Number },
    },
    tripType: { type: String, enum: ["business", "leisure", "adventure", "family", "romantic", "solo"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    weatherSummary: { type: String },
    travelOptions: [
      {
        mode: { type: String },
        timeH: { type: Number },
        cost: { type: Number },
        fastest: { type: Boolean },
        cheapest: { type: Boolean },
      },
    ],
    route: {
      type: [[Number]], // array of [lat, lon]
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Trip", tripSchema);


