const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');

async function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile(`${__dirname}/views/index.html`);

  await runAssessmentTool();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

async function runAssessmentTool() {
    const winsat = spawn('powershell', [
        '-NoProfile', 
        '-NonInteractive', 
        '-Command', 
        '"& {Start-Process WinSAT -ArgumentList \'d3d\' -Verb RunAs -Wait}"'
    ]);;

    winsat.stderr.on('data', (data) => console.error(data));

    winsat.on('close', (statusCode) => {
        getExperienceIndex();
        console.log(`Returned code: ${statusCode}`);
    });
}

function getExperienceIndex() {
    const wei = spawn('powershell.exe', ['-noexit', '"Get-WmiObject -class Win32_WinSAT"']);

    wei.stderr.on('data', (data) => console.error(data));

    wei.stdout.on('data', (data) => {
        console.log(data);
    });

    wei.on('close', (statusCode) => {
        console.log(`Returned code: ${statusCode}`);
    });
}