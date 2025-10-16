const OP = ["AIRTEL_MONEY", "MOOV_MONEY"]


function envIsProd() {
  return (process.env.NODE_ENVIRONMENT || "").toLowerCase() === "prod"
}

function pickRenewUrl() {
  return envIsProd() ? process.env.PVIT_RENEW_URL : process.env.PVIT_RENEW_URL_DEV
}

function pickReceptionUrlCode() {
  return process.env.PVIT_RECEPTION_URL
}

function pickOperationAccountCode(operator) {
  if (envIsProd()) {
    return operator === "AIRTEL_MONEY"
      ? process.env.PVIT_OPERATION_ACCOUNT_AIRTEL
      : process.env.PVIT_OPERATION_ACCOUNT_MOOV
  }
  return operator === "AIRTEL_MONEY"
    ? process.env.PVIT_OPERATION_ACCOUNT_AIRTEL_DEV
    : process.env.PVIT_OPERATION_ACCOUNT_MOOV_DEV
}

export async function renewKey(operator) {
  const codeURL = pickRenewUrl()
  const operationAccountCode = pickOperationAccountCode(operator)
  const receptionUrlCode = pickReceptionUrlCode()
  const password = process.env.PVIT_RENEW_PASSWORD
  const base = process.env.PVIT_BASE_URL

  if (!base || !codeURL || !operationAccountCode || !receptionUrlCode || !password) {
    throw new Error("ENV manquants pour PVit renew")
  }

  const url = `${base}${codeURL}`

  const form = new URLSearchParams()
  form.set("operationAccountCode", operationAccountCode)
  form.set("receptionUrlCode", receptionUrlCode)
  form.set("password", password)

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  })

  const data = await resp.json().catch(() => ({}))
  const ok = resp.ok && (data?.status_code === "200" || data?.status === "200")

  return {
    ok,
    operator,
    raw: data,
    message: ok
      ? "Renouvellement demandé. La clé sera envoyée par PVit sur l’URL de réception."
      : "Renouvellement refusé par PVit",
  }
}
