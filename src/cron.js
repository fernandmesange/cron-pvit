import cron from "node-cron"
import { renewKey } from "./services/renewTask.js"

export function startCron() {
  // toutes les 30 minutes
  cron.schedule("*/1 * * * *", async () => {
    console.log("⏰ CRON : renouvellement des clés…")
    try {
      const airtel = await renewKey("AIRTEL_MONEY")
      const moov = await renewKey("MOOV_MONEY")
      console.log("✅ PVit Airtel:", airtel.message)
      console.log("✅ PVit Moov:", moov.message)
    } catch (err) {
      console.error("❌ Erreur CRON PVit:", err)
    }
  })
}

