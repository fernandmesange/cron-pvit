// server.js
import express from "express"
import receptionSecretRoute from "./routes/reception.route.js";
import { startCron } from "./cron.js"
import dotenv from "dotenv";

dotenv.config();

const app = express()
const PORT = 9100

app.use(express.json())

// Ajout route
app.use("/reception", receptionSecretRoute) 
// Lancer cron
startCron()

// Lancer serveur
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`)
})
