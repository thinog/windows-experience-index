const { app, ipcMain, BrowserWindow } = require('electron');
const assessment = require('./assessment');

let win;

async function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: `${__dirname}/assets/img/icon.ico`,
        webPreferences: {
            nodeIntegration: true,
            devTools: true
        }
    });

    // win.removeMenu();
    win.loadFile(`${__dirname}/index.html`);
}

async function init(){
    const score = await assessment.getExperienceIndex();
    win.webContents.send('initial-score', score);
}

app.whenReady()
    .then(createWindow)
    .then(init);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('run-assessment', async (event) => {
    const score = await assessment.runAssessmentTool();
    event.reply('assessment-done', score);
});