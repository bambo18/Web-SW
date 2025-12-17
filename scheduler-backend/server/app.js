const path = require("path");
const express = require("express");
const cors = require("cors");

const store = require("./store");              // 🔥 추가
const projectRoutes = require("./routes/project.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// 🔥 mysqlStore 초기화 (핵심)
if (typeof store.init === "function") {
  store.init()
    .then(() => {
      console.log("🧱 mysqlStore initialized");
    })
    .catch(err => {
      console.error("❌ mysqlStore init failed", err);
    });
}

app.use("/", projectRoutes);

module.exports = app;
