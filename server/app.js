import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDb from "./utils/db.config.js";
import cors from "cors";
import organizerRoutes from "./routes/orgnizer.route.js";
import eventRoutes from "./routes/event.route.js";

//dotenv configuration
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//body parser configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(bodyParser.json());

//routes
app.get("/", (req, res) => {
  res.send("Welcome to Lensifyr ");
});
app.use("/api/organizer", organizerRoutes);
app.use("/api/event", eventRoutes);

//Server listening
const StartServer = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    console.error(err.message);
    process.exit(1);
  }
};

//Initiate the server
StartServer();
