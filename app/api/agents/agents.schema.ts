import { z } from "zod";

export const CreateAgentSchema = z.object({
  title: z.string({ required_error: "Missing title field" }),
  description: z.string({ required_error: "Missing description field" }),
  price: z.number({ required_error: "Missing price field" }).positive("Price must be greater than 0"),
  category: z.string({ required_error: "Missing category field" }),
  tags: z.array(z.string()).optional(),
});

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;