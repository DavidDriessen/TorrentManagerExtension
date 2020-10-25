import { TorrentLink } from "@/lib/abstract/TorrentServer";

let links: TorrentLink[] = [];

browser.storage.sync.get("links").then(data => {
  if (data.links) links = data.links;
});

browser.runtime.onMessage.addListener(request => {
  switch (request.action) {
    case "saveSettings":
      links = request.data.links;
  }
});

function checkLink(link: string) {
  for (const l of links) {
    if (l.url && link.startsWith(l.url)) return true;
  }
  return false;
}

document.querySelectorAll("a").forEach(el =>
  el.addEventListener("click", ev => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const link = ev.currentTarget.href;
    if (link.match(/^(?:magnet:|bc:)/) || checkLink(link)) {
      ev.preventDefault();
      browser.runtime.sendMessage({ action: "addTorrent", torrent: link });
    }
  })
);
