import { defineConfig } from 'orval';

export default defineConfig({
  dateplan: {
    input: {
      target: '../backend/docs/swagger.json',
    },
    output: {
      target: './lib/api/petstore.ts',
      client: 'axios',
      override: {
        title: () => 'DatePlan API',
      },
    },
  },
});
