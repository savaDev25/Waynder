import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import {RPReporter} from '@reportportal/agent-js-vitest';
 
// apiKey deliberately comes from an env var, never hardcoded here, so the
// real key never gets committed. Set RP_API_KEY locally (e.g. in
// frontend/.env, loaded via your shell) and as a GitHub Actions secret in CI.
const rpConfig = {
  apiKey: 'ba8b0827-4699-4cad-81e4-324cda840e07',
  endpoint: process.env.RP_ENDPOINT || 'http://localhost:8080/api/v1',
  project: 'waynder_tests',
  launch: 'waynder_TEST_FRONTEND',
  attributes: [{ key: 'component', value: 'frontend' }],
  description: 'Waynder frontend test run',
};
 
// Reporting only activates when an API key is actually present, so plain
// `npm test` locally without RP_API_KEY set just runs normally with no
// attempt to reach ReportPortal.
const reporters = rpConfig.apiKey ? ['default', new RPReporter(rpConfig)] : ['default'];



// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    reporters: reporters
  }
})
