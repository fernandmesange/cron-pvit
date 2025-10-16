// routes/receptionSecretRoute.ts
import { Router } from "express";
import { connectDB } from "../db.js";
import { SecretKey } from "../models/secretKey.js";

const router = Router();

function envType() {
  return (process.env.NODE_ENVIRONMENT || "").toLowerCase() === "prod" ? "PROD" : "DEV";
}

function guessOperatorFromAccount(code) {
  if (!code) return undefined;
  const isProd = envType() === "PROD";

  const airtel = isProd
    ? process.env.PVIT_OPERATION_ACCOUNT_AIRTEL
    : process.env.PVIT_OPERATION_ACCOUNT_AIRTEL_DEV;
  const moov = isProd
    ? process.env.PVIT_OPERATION_ACCOUNT_MOOV
    : process.env.PVIT_OPERATION_ACCOUNT_MOOV_DEV;

  if (code === airtel) return "AIRTEL_MONEY";
  if (code === moov) return "MOOV_MONEY";
  return undefined;
}

router.post("/payment/reception-secret", async (req, res) => {
  try {
    await connectDB();

    const contentType = (req.headers["content-type"] || "").toString();
    let payload = {};

    if (contentType.includes("application/json")) {
      payload = req.body;
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      // express.json() et express.urlencoded() gèrent déjà ça
      payload = req.body;
    }

    console.log("📩 Payload reçu PVit:", payload);

    // PVit keys
    const secretKey = payload.secret_key;
    const operationAccountCode = payload.merchant_operation_account_code;
    const expiresIn = payload.expires_in || payload.expiresIn || payload.exprires_at;
    const date = payload.date;

    if (!secretKey || !operationAccountCode) {
      return res.status(400).json({
        ok: false,
        error: "Payload incomplet",
        payload,
      });
    }

    const receivedAt = date ? new Date(date) : new Date();
    const expMs =
      typeof expiresIn === "number" && expiresIn > 0
        ? Number(expiresIn) * 1000
        : 30 * 60 * 1000; // défaut : 30 min
    const expiresAt = new Date(receivedAt.getTime() + expMs);

    const type = envType();
    const operator = guessOperatorFromAccount(operationAccountCode);

    // Désactiver anciennes clés
    await SecretKey.updateMany(
      { operationAccountCode, active: true, type },
      { $set: { active: false, updatedAt: new Date() } }
    );

    // Créer nouvelle clé
    const created = await SecretKey.create({
      operationAccountCode,
      secretKey,
      expiresIn: expiresIn ? Number(expiresIn) : undefined,
      receivedAt,
      active: true,
      expiresAt,
      operator,
      type,
    });

    return res.json({
      ok: true,
      keyId: created._id.toString(),
      operationAccountCode,
      operator: operator ?? null,
      type,
      expiresAt,
    });
  } catch (e) {
    console.error("❌ Reception error:", e);
    return res.status(500).json({
      ok: false,
      error: e?.message ?? "Reception error",
    });
  }
});

export default router;
