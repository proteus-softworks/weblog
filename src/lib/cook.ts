import { Parser } from "@cooklang/cooklang";

let ready = false;

export async function cookParse(text: string) {
  if (!ready) {
    ready = true;
  }

  const parser = new Parser();
  return parser.parse(text);
}
