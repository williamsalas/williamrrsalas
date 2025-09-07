## my personal website

[williamrrsalas.com](https://williamrrsalas.com)

## tech used

- github pages
- github api
- cloudflare workers

## running locally

- In VS Code, use the Live Server (Five Server) extension
- Alternatively:
  - from root directory, `python3 -m http.server 8000`

## using github codespaces for PR VMs

- spin up a PR
- in the top right of the page, click on code -> codespaces -> create it
- the codespace will take some time to build
- after build is done, run `python3 -m http.server 8080 >/tmp/server.log 2>&1 &` from the project root
- if VM didnt open in browser:
  - `shift + command + p in vs code`
  - -> View: Toggle Ports
  - -> right click the address in the Forwarded Address column and open in browser
