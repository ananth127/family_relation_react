const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const familyTreeRoutes = require("./routes/familyTreeRoutes");
app.use("/api/familyTree", familyTreeRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

module.exports = app;
