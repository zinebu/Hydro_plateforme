// server.ts
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/* ---- Static assets from /browser ---- */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/* ---- SSR for all other routes ---- */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/* ---- Start server (CLI, PM2, or standalone) ---- */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT'] ?? 4000);
  app.listen(port, (err?: unknown) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/* ---- Handler used by Angular CLI / Functions ---- */
export const reqHandler = createNodeRequestHandler(app);
