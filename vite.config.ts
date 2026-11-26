/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Vendor chunks: smaller files and better cache reuse across deploys.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'prosemirror', test: /node_modules[\\/](prosemirror-[^\\/]+|@tiptap[\\/]pm|orderedmap|rope-sequence|w3c-keyname)[\\/]/ },
            { name: 'editor', test: /node_modules[\\/](@tiptap|marked|linkifyjs|tippy\.js|@floating-ui)[^]*/ },
          ],
        },
      },
    },
  },
  test: { environment: 'jsdom' },
})
