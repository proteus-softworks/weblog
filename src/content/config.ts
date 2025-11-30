import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { cookLoader } from "./cookLoader";

const postsCollection = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

const recipesCollection = defineCollection({
  loader: cookLoader({ base: "./src/content/recipes" }),
});

export const collections = {
  posts: postsCollection,
  recipes: recipesCollection,
};
