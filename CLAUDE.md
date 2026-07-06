# stadium-tracker

## Dev server + Claude in Chrome

If Claude in Chrome can't reach `http://localhost:3000` while `npm run dev` is
running — e.g. it reports something like "Frame is showing error page" on
navigate, `read_network_requests` shows no document request for the page, but
`curl localhost:3000` / `lsof` from the terminal show the server up fine —
this is a network-isolation mismatch between the shell that started the dev
server and the browser process, not a real server problem.

The tell: the LAN URL Next.js prints alongside `Local: http://localhost:3000`
(e.g. `Network: http://192.168.1.215:3000`) loads correctly in Chrome even
though `localhost` doesn't. **Use that LAN URL in Claude in Chrome instead of
`localhost` for this kind of live debugging** — it's reachable across the
isolation boundary without changing how the dev server is started.
