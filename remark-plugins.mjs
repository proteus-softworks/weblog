import { visit, SKIP } from "unist-util-visit";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export function remarkServerValues() {
  return (tree) => {
    let needsImport = false;

    visit(tree, "text", (node, index, parent) => {
      const regex = /#\(([^)]*)\):(\(([^)]*)\))?/g;

      if (!regex.test(node.value)) return;

      needsImport = true;

      regex.lastIndex = 0;

      const children = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(node.value)) !== null) {
        if (match.index > lastIndex) {
          children.push({
            type: "text",
            value: node.value.slice(lastIndex, match.index),
          });
        }

        children.push({
          type: "mdxJsxTextElement",
          name: "ServerValue",
          attributes: [
            { type: "mdxJsxAttribute", name: "name", value: match[1] },
            { type: "mdxJsxAttribute", name: "server:defer", value: true },
          ],
          children: [
            {
              type: "mdxJsxTextElement",
              name: "Fragment",
              attributes: [
                { type: "mdxJsxAttribute", name: "slot", value: "fallback" },
              ],
              children: [
                {
                  type: "text",
                  value: match[3] ?? "...",
                },
              ],
            },
          ],
        });

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < node.value.length) {
        children.push({
          type: "text",
          value: node.value.slice(lastIndex),
        });
      }

      parent.children.splice(index, 1, ...children);
      return [SKIP, index + children.length];
    });

    // Inject import only if we found at least one #(...)
    if (needsImport) {
      tree.children.unshift({
        type: "mdxjsEsm",
        value: `import ServerValue from "@/components/ServerValue.astro";`,
        data: {
          estree: {
            type: "Program",
            sourceType: "module",
            body: [
              {
                type: "ImportDeclaration",
                source: {
                  type: "Literal",
                  value: "@/components/ServerValue.astro",
                },
                specifiers: [
                  {
                    type: "ImportDefaultSpecifier",
                    local: { type: "Identifier", name: "ServerValue" },
                  },
                ],
              },
            ],
          },
        },
      });
    }
  };
}

export function remarkBacklinks(options = {}) {
  const contentDir = options.contentDir || "src/content/posts";

  // Build slug → title map once per build
  const titleMap = new Map();

  const postsPath = path.resolve(process.cwd(), contentDir);
  if (fs.existsSync(postsPath)) {
    for (const file of fs.readdirSync(postsPath)) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

      const slug = file.replace(/\.mdx?$/, "");
      const content = fs.readFileSync(path.join(postsPath, file), "utf-8");
      const { data } = matter(content);

      titleMap.set(slug, data.title || slug);
    }
  }

  return (tree) => {
    // Matches [[slug]] or (custom text)[[slug]]
    const regex = /(?:\(([^)]*)\))?\[\[([^\]]+)\]\]/g;

    visit(tree, "text", (node, index, parent) => {
      if (!node.value.includes("[[")) return;

      const children = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(node.value)) !== null) {
        if (match.index > lastIndex) {
          children.push({
            type: "text",
            value: node.value.slice(lastIndex, match.index),
          });
        }

        const customText = match[1];
        const slug = match[2];
        const title = customText || titleMap.get(slug) || slug;

        children.push({
          type: "html",
          value: `<a href="/posts/${slug}">${title}</a>`,
        });

        lastIndex = match.index + match[0].length;
      }

      regex.lastIndex = 0;

      if (children.length === 0) return;

      if (lastIndex < node.value.length) {
        children.push({
          type: "text",
          value: node.value.slice(lastIndex),
        });
      }

      parent.children.splice(index, 1, ...children);
      return [SKIP, index + children.length];
    });
  };
}
