const { app, ipcMain, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs')
const assessment = require('./assessment');

let win;

async function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 600,
        center: true,
        resizable: false,
        frame: false,
        icon: `${__dirname}/assets/img/icon-256.ico`,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.webContents.openDevTools();
    win.removeMenu();
    win.loadFile(`${__dirname}/index.html`);

    await loadTranslationArgs();
}

async function loadTranslationArgs() {
    const limits = await assessment.getScoreLimits();

    Object.keys(limits).forEach(objKey => {
        limits[objKey] = limits[objKey].toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        });
    });

    const args = {
        'mainDescription': limits
    };

    win.webContents.send('translation-args', args);
}

async function notifyScore() {
    win.webContents.send('score', await assessment.getExperienceIndex());
    win.webContents.send('assessment-date', await assessment.getAssessmentDate());
}

function log(message) {
    fs.writeFileSync('./debug.log', JSON.stringify(message) + '\n');
    console.log(message)
}

app.whenReady()
    .then(createWindow)
    .then(notifyScore);

app.on('window-all-closed', app.quit);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('run-assessment', async () => {
    await assessment.runAssessmentTool().catch((e) => console.error(e));
    await notifyScore();
});

ipcMain.on('app-minimize', () => win.minimize());
ipcMain.on('app-close', () => win.close());

ipcMain.on('app-maximize', () => {
    if (win.resizable) {
        win.maximize();
    }
});

ipcMain.on('open-github', () => shell.openExternal('https://github.com/thinog'));