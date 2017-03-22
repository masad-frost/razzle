import express from 'express';
import React from 'react';
import axios from 'axios';
import serialize from 'serialize-javascript';
import ReactHelmet from 'react-helmet';
import { renderToString } from 'react-dom/server';
import { StaticRouter, matchPath } from 'react-router-dom';
import App from '../common/App';
import routes from '../common/routes';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const context = {};
    // This data fetching technique came from a gist by @ryanflorence
    // @see https://gist.github.com/ryanflorence/efbe562332d4f1cc9331202669763741

    // First we iterate through our top level routes
    // looking for matches against the current url.
    const matches = routes.map((route, index) => {
      const match = matchPath(req.url, route);
      // We then look for static getInitialData function on each top level component
      if (match) {
        const obj = {
          route,
          match,
          promise: route.component.getInitialData
            ? route.component.getInitialData({ match, req, res, axios })
            : Promise.resolve(null),
        };
        return obj;
      }
      return null;
    });

    // Now we pull out all the promises we found into an array.
    const promises = matches.map(match => match ? match.promise : null);

    // We block rendering until all promises have resolved
    Promise.all(promises)
      .then(data => {
        const context = {};

        // Pass our routes and data array to our App component
        const markup = renderToString(
          <StaticRouter context={context} location={req.url}>
            <App routes={routes} initialData={data} />
          </StaticRouter>
        );

        // We rewind ReactHelmet for meta tags
        const head = ReactHelmet.renderStatic();

        if (context.url) {
          res.redirect(context.url);
        } else {
          res.status(200).send(
            `<!doctype html>
        <html lang="">
        <head>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta charSet='utf-8' />
            ${head.title.toString()}
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="${assets.client.js}" defer></script>
            ${head.meta.toString()}
            ${head.link.toString()}
        </head>
        <body>
            <div id="root">${markup}</div>
            <script>window.DATA = ${serialize(data)};</script>
        </body>
    </html>`
          );
        }
      })
      .catch(
        e =>
          console.log(e) ||
          res.status(500).json({ error: error.message, stack: error.stack })
      );
  });

export default server;
