import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

export default defineConfig({
    plugins: [react(), TanStackRouterVite()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            // Proxying API requests to another domain
            '/api': {
                target: 'http://54.152.95.111:443/api/v1/', // The backend server URL
                changeOrigin: true, // Needed for virtual hosted sites
                rewrite: (path) => path.replace(/^\/api/, ''), // Rewrite the API path
            },
        },
    },
});
