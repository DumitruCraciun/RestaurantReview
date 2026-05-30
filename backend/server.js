// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const restaurantsRouter = require("./routes/restaurants");
const starredRestaurantsRouter = require("./routes/starredRestaurants");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Routes
app.use("/restaurants", restaurantsRouter);
app.use("/restaurants/starred", starredRestaurantsRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "RestaurantReview API is running!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});