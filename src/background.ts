import { ServerManager } from "@/lib/ServerManager";

const serverManager = new ServerManager();

browser.runtime.onMessage.addListener(request => {
  switch (request.action) {
    case "addTorrent":
      browser.tabs.create({
        url: browser.extension.getURL(
          "index.html#/addServer/" + encodeURIComponent(request.torrent)
        )
      });
  }
});

browser.webRequest.onBeforeSendHeaders.addListener(
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  (details: {
    requestHeaders: Array<{ name: string; value: string }>;
    url: string;
  }) => {
    for (let i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name === "Origin")
        details.requestHeaders[i].value = details.url;
    }
    return {
      requestHeaders: details.requestHeaders
    };
  },
  { urls: ["*://*/api/v2/torrents/addServer"] },
  ["blocking", "requestHeaders", "extraHeaders"]
);

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
window.serverManager = serverManager;
