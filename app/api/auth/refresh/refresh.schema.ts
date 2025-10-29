import { z } from "zod";

export const RefreshSchema = z.object({
  refreshToken: z.string({
    required_error: "Missing refresh token", 
    }).min(1, "Refresh token cannot be empty"),
  strategy: z.enum(["bearer", "cookie"], {
    required_error: "Invalid authentication strategy",
  }).default("bearer"),
});

export type RefreshInput = z.infer<typeof RefreshSchema>;