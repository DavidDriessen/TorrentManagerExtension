import { TorrentLink } from "@/lib/abstract/TorrentServer";

let links: TorrentLink[] = [];
let enabled = true;

browser.storage.sync.get(["links", "linksEnabled"]).then(data => {
  if (data.links) links = data.links;
  if (data.linksEnabled != undefined) enabled = data.linksEnabled;
});

function checkLink(link: string) {
  for (const l of links) {
    if (l.url && link.startsWith(l.url)) return true;
  }
  return false;
}

document.querySelectorAll("a").forEach(el =>
  el.addEventListener("click", ev => {
    if (enabled) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const link = ev.currentTarget.href;
      if (
        link.match(/^(?:magnet:|bc:)/) ||
        link.endsWith(".torrent") ||
        checkLink(link)
      ) {
        ev.preventDefault();
        browser.runtime.sendMessage({ action: "addTorrent", torrent: link });
      }
    }
  })
);
