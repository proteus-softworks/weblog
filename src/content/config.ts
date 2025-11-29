import { defineCollection, z } from "astro:content";
import { glob, type Loader, type LoaderContext } from "astro/loaders";
import { cookLoader } from "./cookLoader";

const postsCollection = defineCollection({
  // Load Markdown and MDX files in the `src/content/` directory.
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
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
