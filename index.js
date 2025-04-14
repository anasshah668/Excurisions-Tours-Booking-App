import express, { json } from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import cors from "cors";
// Load environment variables
config();
// const swaggerDocument = JSON.parse(fs.readFileSync("./swagger-output.json"));
const swaggerDocument = fs.readFileSync("./swagger-output.json", "utf8");
const app = express();
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true, // If you need to include credentials like cookies or auth headers
};

app.use(cors());
// Middleware to parse JSON request bodies
app.use(json());

// Connect to MongoDB
connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

app.get("/", (req, res) => {
  console.log(res.json({ message: "Server running" }));
});
// Start the server
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
