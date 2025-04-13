import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Pharmacy POS Software",
    //  description: "Description",
    version: "1.0.0",
  },
  host: "localhost:3001",
  basePath: "/",
  schemes: "http",
};
const outputFile = "./swagger-output.json";
const endpointsFiles = ["./index.js"];
swaggerAutogen(outputFile, endpointsFiles, doc);
