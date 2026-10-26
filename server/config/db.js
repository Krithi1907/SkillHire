const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4
        });

        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);

        if (error.reason?.servers) {
            for (const [host, server] of error.reason.servers) {
                console.log("\nSERVER:", host);
                console.log("TYPE:", server.type);
                console.log(
                    "ERROR:",
                    server.error?.message || "No specific error"
                );
            }
        }

    }
};

module.exports = connectDB;