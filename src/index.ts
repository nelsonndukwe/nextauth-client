#!/usr/bin/env node

const message = (msg: string) => {
  console.log(`%c${msg}`, "color: #00f; font-weight: bold;");
};

message("Hello, World!, This is a TypeScript script running in Node.js!");
