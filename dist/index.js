"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const http = __importStar(require("http"));
const slugify_1 = __importDefault(require("slugify"));
const url = __importStar(require("url"));
const replaceTemplate_1 = __importDefault(require("./modules/replaceTemplate"));
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, "utf-8");
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, "utf-8");
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, "utf-8");
let data;
let dataObj;
try {
    data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
    dataObj = JSON.parse(data);
}
catch (error) {
    console.error("Could not read or parse data.json", error);
    process.exit(1);
}
const slugs = dataObj.map((el) => (0, slugify_1.default)(el.productName, { lower: true }));
console.log(slugs);
const server = http.createServer((req, res) => {
    const { query, pathname } = url.parse(req.url, true);
    if (pathname === "/" || pathname === "/overview") {
        res.writeHead(200, { "Content-Type": "text/html" });
        const cardsHtml = dataObj
            .map((el) => (0, replaceTemplate_1.default)(tempCard, el))
            .join("");
        const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
        res.end(output);
    }
    else if (pathname === "/product") {
        res.writeHead(200, { "Content-Type": "text/html" });
        const product = dataObj[Number(query["id"])];
        if (product) {
            const output = (0, replaceTemplate_1.default)(tempProduct, product);
            res.end(output);
        }
        else {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>Product not found!</h1>");
        }
    }
    else if (pathname === "/api") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
    }
    else {
        res.writeHead(404, {
            "Content-Type": "text/html",
            "my-own-header": "hello-world",
        });
        res.end("<h1>Page not found!</h1>");
    }
});
server.listen(8000, "127.0.0.1", () => {
    console.log("Listening to requests on port 8000");
});
