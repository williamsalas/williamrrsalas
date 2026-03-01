## my personal website

[williamrrsalas.com](https://williamrrsalas.com)

## tech used

- react + typescript
- vite
- less
- prettier
- github pages
- github actions
- vitest + react testing library

## running locally

```bash
npm install
npm run dev
```

then open http://localhost:5173

## other commands

```bash
npm run build     # type-check + production build
npm run preview   # preview production build
npm test          # run tests
npm run lint      # check formatting
npm run format    # fix formatting
```

## using github codespaces for PR VMs

- spin up a PR
- in the top right of the page, click on code -> codespaces -> create it
- the codespace will take some time to build
- after build is done, the dev server starts automatically on port 5173
- if VM didnt open in browser:
  - `shift + command + p in vs code`
  - -> View: Toggle Ports
  - -> right click the address in the Forwarded Address column and open in browser
