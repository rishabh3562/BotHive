import { z } from "zod";

export const CreateAgentSchema = z.object({
 title: z.string({ required_error: "Missing title field" })
    .min(1, "Title cannot be empty")
    .max(200, "Title must be 200 characters or less"),
  description: z.string({ required_error: "Missing description field" })
    .min(1, "Description cannot be empty")
    .max(5000, "Description must be 5000 characters or less"),
  price: z.number({ required_error: "Missing price field" }).positive("Price must be greater than 0"),
  category: z.string({ required_error: "Missing category field" })
    .min(1, "Category cannot be empty")
    .max(100, "Category must be 100 characters or less"),
  tags: z.array(z.string().max(50, "Each tag must be 50 characters or less"))
    .max(20, "Maximum 20 tags allowed")
    .optional(),
});

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;