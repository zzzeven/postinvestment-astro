import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react({ experimentalReactChildren: true }),
    tailwind({ applyBaseStyles: false }),
  ],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  base: '/postinvest',
  vite: {
    ssr: {
      noExternal: ['@radix-ui/react-*'],
    },
  },
});
