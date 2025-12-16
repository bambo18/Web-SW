const path = require("path");
const express = require("express");
const cors = require("cors");

const projectRoutes = require("./routes/project.routes");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 여기 수정
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/", projectRoutes);

module.exports = app;
