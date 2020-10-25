module.exports = {
  transpileDependencies: ["vuetify"],

  pages: {
    contentScript: {
      entry: "src/contentScript/main.ts",
      title: "ContentScript"
    },
    popup: {
      template: "public/browser-extension.html",
      entry: "src/popup/main.ts",
      title: "Popup"
    },
    standalone: {
      template: "public/browser-extension.html",
      entry: "src/main/main.ts",
      title: "QbitTorrent client",
      filename: "index.html"
    }
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: "src/background.ts"
        },
        contentScripts: {
          entries: {
            contentScript: ["src/contentScript/main.ts"]
          }
        }
      }
    }
  }
};
