let links: string[] = [];

browser.storage.sync.get("links").then(data => {
  if (data.links) links = data.links;
});

function checkLink(link: string) {
  for (const l of links) {
    if (link.startsWith(l)) return true;
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
