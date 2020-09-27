# QBitTorrent client chrome extension

This is a chrome extension for torrent clients with a web-api functionality.

### Reason of creation
The reason to make this extension is that the web-interface of QBitTorrent very slow is when having a lot of torrents.

### Supported servers
Currently, the only torrent server that is supported is Qbittorrent 4.2 and up.

### Install
To install the extension go to:
\
https://chrome.google.com/webstore/detail/bnajgmchnmlnjggkflnpjllgpjbckoja?authuser=1&hl=en-GB
\
and click install.

### How to use self signed cert
1. Open Chrome settings, scroll to the bottom, and click Show advanced settings...
2. Under HTTPS/SSL, click Manage certificates...
3. Click the Trusted Root Certification Authorities tab, then click the Import... button. This opens the Certificate Import Wizard. Click Next to get to the File to Import screen.
4. Click Browse... and select the certificate file you saved earlier, then click Next.
5. Select Place all certificates in the following store. The selected store should be Trusted Root Certification Authorities. If it isn't, click Browse... and select it. Click Next and Finish
6. Click Yes on the security warning.
