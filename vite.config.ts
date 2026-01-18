import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base = isGithubActions && repoName ? `/${repoName}/` : '/';

  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
