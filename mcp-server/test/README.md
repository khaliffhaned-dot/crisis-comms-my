# MCP tool smoke test

Run the in-process Worker/MCP smoke tests with:

```sh
npm run test:tools
```

The test uses the Worker's exported `fetch` handler and MCP JSON-RPC over local
`Request` objects. It does not deploy the Worker or make network requests.
