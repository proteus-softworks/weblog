import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { cookLoader } from "./cookLoader";

const postsCollection = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date().optional(),
      draftDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

const obsidianPostsCollection = defineCollection({
  loader: glob({ base: "./src/content/weblog-docs", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date().optional(),
      draftDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

const recipesCollection = defineCollection({
  loader: cookLoader({ base: "./src/content/recipes" }),
});

export const collections = {
  posts: postsCollection,
  obsidianPosts: obsidianPostsCollection,
  recipes: recipesCollection,
};
