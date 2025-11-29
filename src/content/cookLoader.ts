import { z } from "astro:content";
import { type Loader } from "astro/loaders";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Recipe } from "@cooklang/cooklang-ts";

const shoppingItemSchema = z.object({
  name: z.string(),
  synonym: z.string().optional(),
});

const recipeSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.any()).default([]),
  cookwares: z.array(z.any()).default([]),
  metadata: z.record(z.string()).default({}),
  steps: z.array(z.array(z.any())).default([]),
  shoppingList: z.record(shoppingItemSchema).optional(),
});

function fileToId(filename: string): string {
  return path.basename(filename, ".cook");
}

function parseRecipe(content: string, id: string) {
  const recipe = new Recipe(content);
  return {
    id,
    title: (recipe.metadata.title as string) || id,
    ingredients: recipe.ingredients,
    cookwares: recipe.cookwares,
    metadata: recipe.metadata,
    steps: recipe.steps,
    shoppingList: recipe.shoppingList,
  };
}

async function loadRecipeFile(
  recipesDir: string,
  filename: string,
): Promise<ReturnType<typeof parseRecipe>> {
  const content = await fs.readFile(path.join(recipesDir, filename), "utf-8");
  return parseRecipe(content, fileToId(filename));
}

export function cookLoader({ base }: { base: string }): Loader {
  const recipesDir = path.resolve(base);

  return {
    name: "cook-loader",

    load: async ({ store, watcher, parseData, logger }): Promise<void> => {
      const files = await fs.readdir(recipesDir);
      const cookFiles = files.filter((f) => f.endsWith(".cook"));

      store.clear();

      for (const file of cookFiles) {
        try {
          const entry = await loadRecipeFile(recipesDir, file);
          const data = await parseData({ id: entry.id, data: entry });
          store.set({ id: entry.id, data });
        } catch (err) {
          logger.error(`Failed to load ${file}: ${err}`);
        }
      }

      watcher?.on("change", async (changedPath) => {
        if (!changedPath.endsWith(".cook")) return;

        const id = fileToId(changedPath);
        logger.info(`Reloading recipe: ${id}`);

        try {
          const content = await fs.readFile(changedPath, "utf-8");
          const entry = parseRecipe(content, id);
          const data = await parseData({ id: entry.id, data: entry });
          store.set({ id: entry.id, data });
        } catch (err) {
          logger.error(`Failed to reload ${id}: ${err}`);
        }
      });

      watcher?.on("add", async (addedPath) => {
        if (!addedPath.endsWith(".cook")) return;

        const id = fileToId(addedPath);
        logger.info(`Adding recipe: ${id}`);

        try {
          const content = await fs.readFile(addedPath, "utf-8");
          const entry = parseRecipe(content, id);
          const data = await parseData({ id: entry.id, data: entry });
          store.set({ id: entry.id, data });
        } catch (err) {
          logger.error(`Failed to add ${id}: ${err}`);
        }
      });

      watcher?.on("unlink", (removedPath) => {
        if (!removedPath.endsWith(".cook")) return;

        const id = fileToId(removedPath);
        logger.info(`Removing recipe: ${id}`);
        store.delete(id);
      });

      watcher?.add(recipesDir);
    },

    schema: () => recipeSchema,
  };
}
