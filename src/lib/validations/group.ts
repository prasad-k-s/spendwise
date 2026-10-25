import { z } from "zod";

export const groupNameSchema = z
  .string()
  .trim()
  .min(1, "Give your group a name")
  .max(60, "Keep the name under 60 characters");
