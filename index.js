import fs from 'fs-extra';
import {getAuthenticatedFetch} from "./src/client-credentials.js";
import {QueryEngine} from "@comunica/query-sparql";
import fetch from "node-fetch";

main();

async function main() {
  const config = await fs.readJson('config.json');

  console.log('Fetching a public resource as Turtle:');
  // We can use a fetch without authentication (from "node-fetch") because the resource is public.
  let response = await fetch('http://localhost:3000/example/wish-list', {
    headers: {
      'accept': 'text/turtle'
    }
  });
  let result = await response.text();
  console.log(result);

  console.log('Fetching a private resource as Turtle:');
  // We need to use an authenticated fetch because the resource is private.
  // The signature of the unauthenticated and authenticated fetch are the same/
  let authFetch = await getAuthenticatedFetch(config);
  response = await authFetch('http://localhost:3000/example/favourite-books', {
    headers: {
      'accept': 'text/turtle'
    }
  });
  result = await response.text();
  console.log(result);

  console.log('Querying a private resource with Comunica:');
  authFetch = await getAuthenticatedFetch(config);
  const myEngine = new QueryEngine();
  const bindingsStream = await myEngine.queryBindings(`
  SELECT ?title ?author WHERE {
    ?book a schema:Book;
      schema:name ?title;
      schema:creator [
        schema:name ?author
      ].
      
  }`, {
    sources: ['http://localhost:3000/example/favourite-books'],
    fetch: authFetch // If you don't provide the authenticated fetch, Comunica will not be able to access the private resource.
  });

  const bindings = await bindingsStream.toArray();

  for (const binding of bindings) {
    console.log(`"${binding.get('title').value}" by ${binding.get('author').value}`);
  }
}
