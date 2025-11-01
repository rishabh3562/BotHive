import { z } from "zod";

export const SignUpSchema = z.object({
    email: z.string({
        required_error: "Missing email field"
    }).email("Invalid email format"),
    password: z.string({
        required_error: "Missing password field"  
    }).min(8, "Password must be at least 8 characters"),
    full_name: z.string({
        required_error: "Missing full name field"  
    }).min(1, "Full name cannot be empty"),
    role: z.enum(["builder", "recruiter", "admin"], {
        errorMap: () => ({ message: "Invalid role. Must be builder, recruiter, or admin" })
    }),
    strategy: z.enum(["bearer", "cookie"], {
        required_error: "Invalid authentication strategy",
    }).default("bearer"),
})

export type SignUpInput = z.infer<typeof SignUpSchema>; 