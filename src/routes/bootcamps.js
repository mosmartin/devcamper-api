const express = require("express");
const router = express.Router();

// get all bootcamps
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Show all bootcamps"
  });
});

// get a single bootcamp
router.get("/:id", (req, res) => {
  res.status(200).json({
    success: true,
    message: `Show bootcamp ${req.params.id}`
  });
});

// create a bootcanp
router.post("/", (req, res) => {
  res.status(201).json({
    success: true,
    message: `Create new bootcamp`
  });
});

// update a bootcamp
router.put("/:id", (req, res) => {
  res.status(200).json({
    success: true,
    message: `Update bootcamp ${req.params.id}`
  });
});

// delete a bootcamp
router.delete("/:id", (req, res) => {
  res.status(200).json({
    success: true,
    message: `Delete bootcamp ${req.params.id}`
  });
});

module.exports = router;
