import express, { json } from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/stripesRoute.js";
import uploadRoutes from "./routes/GateWayRoute/uploadRoute.js";
import openAiRoutes from "./routes/GateWayRoute/openAiRoute.js";
import productRoutes from "./routes/ProductRoute.js";
import faqRoutes from "./routes/faqRoutes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Swagger document safely
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "swagger-output.json"), "utf8")
);

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors());
app.use(json());

// Connect to MongoDB
connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Swagger docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//OpenAi Routes

app.use("/api/openai", openAiRoutes);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/gateWay", uploadRoutes);
app.use("/api/product", productRoutes);
app.use("/api/search", faqRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Server running" });
});

// Start the server
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
