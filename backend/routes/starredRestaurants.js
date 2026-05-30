// backend/routes/starredRestaurants.js
const express = require("express");
const router = express.Router();
const supabaseProvider = require("../provider/supabase");
const flattenObject = require("../utils/flattenObject");

/**
 * Feature 6: Getting the list of all starred restaurants.
 */
router.get("/", async (_req, res) => {
  // Ia toate restaurantele favorite
  const { data: starred, error: starredError } = await supabaseProvider
    .from("starred_restaurants")
    .select("*");
  
  if (starredError) {
    res.status(500).json({ error: starredError.message });
    return;
  }

  // Ia numele restaurantelor
  const { data: allRestaurants, error: restaurantsError } = await supabaseProvider
    .from("restaurants")
    .select("id, name");
  
  if (restaurantsError) {
    res.status(500).json({ error: restaurantsError.message });
    return;
  }

  // Unește datele manual
  const result = starred.map(star => ({
    id: star.id,
    comment: star.comment,
    name: allRestaurants.find(r => r.id === star.restaurantId)?.name || "Unknown"
  }));

  res.json(result);
});

/**
 * Feature 7: Getting a specific starred restaurant.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Find the restaurant with the matching id.
  const { data } = await supabaseProvider.from("starred_restaurants").select("*").eq("id", id);
  const restaurant = data.length > 0 ? data[0] : undefined;

  // If the restaurant doesn't exist, let the client know.
  if (!restaurant) {
    res.sendStatus(404);
    return;
  }

  res.json(restaurant);
});

/**
 * Feature 8: Adding to your list of starred restaurants.
 */
router.post("/", async (req, res) => {
  const { body } = req;
  const { id } = body;

  // Find the restaurant with the matching id.
  const { data: restaurantData } = await supabaseProvider.from("restaurants")
    .select("*")
    .eq("id", id);
  const restaurant = restaurantData.length > 0 ? restaurantData[0] : undefined;

  if (!restaurant) {
    res.sendStatus(404);
    return;
  }

  const { data, error } = await supabaseProvider.from("starred_restaurants").insert([
    { "restaurantId": id, comment: null }]).select(`
		id,
		comment,
		restaurants (
			id,
			name
		)
	`);

  if (error || data.length !== 1) {
    res.status(400).send({ error });
    return;
  }

  res.json(flattenObject(data[0]));
});

/**
 * Feature 9: Deleting from your list of starred restaurants.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseProvider.from("starred_restaurants")
    .delete()
    .match({ id: id });

  if (error) {
    res.status(404).send({ error });
    return;
  }

  res.sendStatus(200);
});

/**
 * Feature 10: Updating your comment of a starred restaurant.
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { newComment } = req.body;

  const { error } = await supabaseProvider.from("starred_restaurants")
    .update({ comment: newComment })
    .match({ id: id });
  if (error) {
    res.status(404).send({ error });
    return;
  }

  res.sendStatus(200);
});

module.exports = router;
