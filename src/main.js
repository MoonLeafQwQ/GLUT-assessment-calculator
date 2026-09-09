const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  shell,
  nativeTheme,
} = require("electron");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const modalPath = path.join(__dirname, "../renderer/xlsx/模板.xlsx");
const {
  spawnResultTableFromDataObj,
  parseTableToDataObj,
} = require("./tools/tools");

function applyImmersiveDarkMode(win, dark) {
  if (!win || win.isDestroyed() || process.platform !== "win32") return;
  try {
    const buf = win.getNativeWindowHandle();
    const hwnd = buf.readBigUInt64LE(0).toString();
    const value = dark ? 1 : 0;
    const script = `
Add-Type -Namespace W -Name N -MemberDefinition '[DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);';
$v = ${value};
[W.N]::DwmSetWindowAttribute([IntPtr]${hwnd}, 20, [ref]$v, 4) | Out-Null;
[W.N]::DwmSetWindowAttribute([IntPtr]${hwnd}, 19, [ref]$v, 4) | Out-Null;
`;
    execFile(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { windowsHide: true },
      () => {}
    );
  } catch (e) {
    // ignore
  }
}

function windowBackgroundColor() {
  return nativeTheme.shouldUseDarkColors ? "#1e1e22" : "#ffffff";
}

function applyWindowBackgrounds(wins) {
  const color = windowBackgroundColor();
  wins.forEach((w) => {
    if (w && !w.isDestroyed()) w.setBackgroundColor(color);
  });
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("electron-fiddle", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("electron-fiddle");
}

if (require("electron-squirrel-startup")) {
  app.quit();
}

function createWindow() {
  const bgColor = windowBackgroundColor();
  const settingPage = new BrowserWindow({
    show: false,
    width: 860,
    height: 900,
    backgroundColor: bgColor,
    webPreferences: {
      preload: SETTING_PRELOAD_WEBPACK_ENTRY,
    },
  });
  settingPage.setMenuBarVisibility(false);
  settingPage.on("close", (e) => {
    e.preventDefault();
    settingPage.hide();
  });
  settingPage.loadURL(SETTING_WEBPACK_ENTRY);

  const win = new BrowserWindow({
    width: 1024,
    height: 800,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: bgColor,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  applyImmersiveDarkMode(win, nativeTheme.shouldUseDarkColors);
  applyImmersiveDarkMode(settingPage, nativeTheme.shouldUseDarkColors);

  const menu = Menu.buildFromTemplate([
    {
      label: "文件",
      submenu: [
        {
          label: "打开",
          click: async () => {
            const stateObj = await dialog.showOpenDialog({
              title: "打开综测表单，格式仅支持xlsx",
              filters: [{ name: "综测文件", extensions: ["xlsx"] }],
              properties: ["openFile"],
              defaultPath: path.join(__dirname, "../../"),
            });
            const { canceled, filePaths } = stateObj;
            if (canceled) {
              return;
            }
            if (filePaths[0].endsWith(".xlsx")) {
              const parseRet = await parseTableToDataObj(filePaths[0]);
              if (!parseRet) {
                await dialog.showMessageBox({
                  title: "解析失败",
                  type: "error",
                  message: "表单格式与综测表单不符",
                });
                return;
              }
              win.webContents.send("import-xlsx", parseRet);
            } else {
              await dialog.showMessageBox({
                title: "格式错误",
                type: "error",
                message: "解析表单仅支持xlsx格式，请将表单转换为xlsx格式",
              });
            }
          },
        },
        {
          label: "导出为",
          click: () => win.webContents.send("send-export-xlsx"),
        },
      ],
    },
    {
      label: "设置",
      submenu: [
        {
          label: "设置分数占比",
          click: () => win.webContents.send("open-setting"),
        },
        {
          label: "自定义公式",
          click: () => win.webContents.send("open-formulas"),
        },
      ],
    },
  ]);

  win.setMenu(menu);

  win.on("resize", () => {
    win.webContents.send("window-resize");
  });

  win.on("maximize", () => {
    win.webContents.send("window-resize");
  });
  win.on("unmaximize", () => {
    win.webContents.send("window-resize");
  });

  win.on("closed", () => {
    settingPage.destroy();
  });

  ipcMain.handle("open-shell", async (e, url) => {
    const target = typeof url === "string" && url ? url : "https://github.com/millnasis/GLUT-assessment-calculator";
    shell.openExternal(target);
  });

  ipcMain.handle("export-xlsx", async (e, ...args) => {
    const dataObj = args[0];
    const stateObj = await dialog.showSaveDialog({
      title: "导出综测文件",
      filters: [{ name: "综测文件", extensions: ["xlsx"] }],
      defaultPath: path.join(__dirname, "../../我的综测文件.xlsx"),
    });
    if (stateObj.canceled) {
      return;
    }
    try {
      await spawnResultTableFromDataObj(dataObj, stateObj.filePath, modalPath);
    } catch (error) {
      await dialog.showMessageBox({
        title: "导出失败",
        type: "error",
        message: `导出失败：${error && error.message ? error.message : error}`,
      });
    }
  });

  ipcMain.handle("send-setting-object", async (e, ...args) => {
    const settingObj = args[0];
    settingPage.webContents.send("get-setting", settingObj);
    settingPage.show();
  });

  ipcMain.handle("send-formulas-object", async (e, ...args) => {
    const settingObj = args[0];
    settingPage.webContents.send("get-formulas", settingObj);
    settingPage.show();
  });

  ipcMain.handle("new-setting-object", async (e, ...args) => {
    const settingObj = args[0];
    win.webContents.send("apply-setting", settingObj);
  });

  nativeTheme.on("updated", () => {
    applyWindowBackgrounds([win, settingPage]);
    applyImmersiveDarkMode(win, nativeTheme.shouldUseDarkColors);
    applyImmersiveDarkMode(settingPage, nativeTheme.shouldUseDarkColors);
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
