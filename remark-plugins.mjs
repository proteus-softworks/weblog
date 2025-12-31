import { visit, SKIP } from "unist-util-visit";

export function remarkServerValues() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      const regex = /#\(([^)]*)\):(\(([^)]*)\))?/g;

      if (!regex.test(node.value)) return;

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
                  value: match[3] ?? "Fallback...",
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
  };
}

export function remarkBacklinks() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      const regex = /\(([^)]*)\)\[\[([^\]]*)\]\]/g;

      if (!regex.test(node.value)) return;

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
          type: "html",
          value: `<a href="${match[2]}">${match[1]}</a>`,
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
  };
}
