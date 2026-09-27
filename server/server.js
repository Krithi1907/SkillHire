require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = require("./config/db");
const app = require("./app");

const PORT = 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`SkillHire server running on http://localhost:${PORT}`);
});