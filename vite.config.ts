import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const pagesBuildInfo = {
  commit: process.env.CF_PAGES_COMMIT_SHA || '',
  branch: process.env.CF_PAGES_BRANCH || '',
  url: process.env.CF_PAGES_URL || '',
  isPages: process.env.CF_PAGES === '1',
}

// These values are public build metadata only; never inject secrets here.
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_INFO__: JSON.stringify(pagesBuildInfo),
  },
})
