import swaggerAutogen from "swagger-autogen";

// Use different host for local vs production
const isProd = process.env.NODE_ENV === "production";
const host = isProd
  ? "excurisions-tours-booking-app.vercel.app"
  : "localhost:3005"; // match your local server port

const doc = {
  info: {
    title: "Excursions Trips",
    version: "1.0.0",
  },
  host,
  basePath: "/",
  schemes: isProd ? ["https"] : ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./index.js"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
