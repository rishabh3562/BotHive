import { z } from "zod";

export const SignInSchema = z.object({
    email: z.string({
        required_error:  "Missing email field"  
    }),
    password: z.string({
        required_error: "Missing password field"
    }),
    strategy: z.enum(["bearer", "cookie"], {
        required_error: "Invalid authentication strategy",
    }).default("bearer"),
});

export type SignInInput = z.infer<typeof SignInSchema>;