import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (_req, res) => res.send("DTS Backend is running!"));

export default app;
