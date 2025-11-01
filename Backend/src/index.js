import app from "./app.js";
import aiRoutes from "./routes/ai.routes.js";
import { connectDB } from "./db/index.js";
import { config } from "dotenv";
config();

connectDB().then(() => {
  app.use("/api/ai", aiRoutes);
  const port = process.env.PORT || 5001;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
