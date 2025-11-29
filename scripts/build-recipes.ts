import { Parser } from "@cooklang/cooklang";

const parser = new Parser();
const recipe = parser.parse(`
>> servings: 4

Add @salt and @pepper to taste.
Cook for ~{10%minutes}.
`);

console.log(recipe.sections[0].content);
