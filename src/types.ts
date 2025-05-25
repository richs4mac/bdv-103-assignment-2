import { z } from "zod";

export type BookID = string;

// zod uuid validation doesn't work https://github.com/colinhacks/zod/issues/91
// regex from https://ihateregex.io/expr/uuid/#
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

export const bookSchema = z.object({
  id: z.string().regex(uuidRegex).optional(),
  name: z.string().trim().min(1),
  author: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.number(),
  image: z.string().trim().min(1),
});

export type Book = z.infer<typeof bookSchema>;

