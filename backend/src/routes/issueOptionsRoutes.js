const express = require("express");
const router = express.Router();
const IssueOption = require("../models/IssueOption");

// GET all options หรือ filter ตาม category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    if (category) {
      // ดึงเฉพาะ category ที่ส่งมา
      const option = await IssueOption.findOne({ category });
      if (!option) return res.status(404).json({ message: "Category not found" });

      // ส่ง subOptions array กลับ
      return res.json(option.subOptions);
    }

    // ถ้าไม่มี query -> ส่ง options ทั้งหมด
    const allOptions = await IssueOption.find({});
    res.json(allOptions); // [{ category, subOptions: [...] }, ...]
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot fetch issue options" });
  }
});

// POST create multiple options
router.post("/", async (req, res) => {
  try {
    const options = req.body;

    if (!Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ message: "Body must be a non-empty array" });
    }

    // validate each option
    const toSave = [];
    for (const opt of options) {
      const { category, subOptions } = opt;
      if (!category || !subOptions || !Array.isArray(subOptions)) {
        return res.status(400).json({ message: "Each option must have category and subOptions array" });
      }
      toSave.push({ category, subOptions });
    }

    // save all
    const created = await IssueOption.insertMany(toSave);

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot create issue options" });
  }
});

module.exports = router;
