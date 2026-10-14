import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  globalIgnores(["supabase/.temp/**", "supabase/.branches/**", "supabase/snippets/**"]),
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
