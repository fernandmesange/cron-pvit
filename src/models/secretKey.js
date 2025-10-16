import { Schema, model} from "mongoose";
import mongoose from "mongoose";


const secretKeySchema = new Schema(
  {
    operationAccountCode: { type: String, required: true, index: true },
    secretKey: { type: String, required: true },
    expiresIn: { type: Number },
    receivedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
    type: {
      type: String,
      enum: ["DEV", "PROD",],
      default: "PROD",
    },
    operator:{
        type:String,
        enum: ["AIRTEL_MONEY", "MOOV_MONEY"]
    }
  },
  { timestamps: true }
);

secretKeySchema.index({ operationAccountCode: 1, active: 1 });

export const SecretKey =
  mongoose.models.SecretKey || model("SecretKey", secretKeySchema);
