import app from "./app.js";
import { connectDB } from "./db/index.js";
import { config } from "dotenv";
config();

connectDB().then(() => {
  const port = process.env.PORT || 5001;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
