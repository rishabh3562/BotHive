import { UserRole } from "@/lib/database/mongoose";
import { z } from "zod";

export const SignUpSchema = z.object({
    email: z.string({
        required_error:  "Missing email field"
    }),
    password: z.string({
        required_error:  "Missing password field"  
    }),
    full_name: z.string({
        required_error: "Missing full name field"  
    }),
    role: z.custom<UserRole>((val) =>
        val === "builder" || val === "recruiter" || val === "admin"
    ),
    strategy: z.enum(["bearer", "cookie"], {
        required_error: "Invalid authentication strategy",
    }).default("bearer"),
})

export const UserRoleSchema = z.enum(["builder", "recruiter", "admin"])

export type SignUpInput = z.infer<typeof SignUpSchema>;