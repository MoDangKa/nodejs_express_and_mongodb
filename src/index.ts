import * as fs from 'fs';
import * as http from 'http';
import slugify from 'slugify';
import * as url from 'url';
import replaceTemplate from './modules/replaceTemplate';
import { Product } from './types';

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
let data: string;
let dataObj: Product[];
try {
  data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
  dataObj = JSON.parse(data) as Product[];
} catch (error) {
  console.error('Could not read or parse data.json', error);
  process.exit(1);
}

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  const { query, pathname } = url.parse(req.url as string, true);

  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const cardsHtml = dataObj.map((el: Product) => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const product = dataObj[Number(query['id'] as any)];
    if (product) {
      const output = replaceTemplate(tempProduct, product);
      res.end(output);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>Product not found!</h1>');
    }
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  } else {
    res.writeHead(404, {
      'Content-Type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
