const { spawn } = require('child_process');
const fs = require('fs');

async function runAssessmentTool() {
    return new Promise(async (resolve, reject) => {
        // const winsat = spawn(
        //     'run-as-admin.bat',
        //     ['WinSAT', 'mem'],
        //     { shell: 'powershell.exe', windowsHide: false });

        const winsat = spawn(
            'Start-Process',
            ['WinSAT', '-ArgumentList', '"mem"', '-Verb', 'RunAs', '-Wait'],
            { shell: 'powershell.exe', windowsHide: false });

        winsat.stderr.on('data', (data) => reject(data));

        winsat.on('close', async (code) => {
            return resolve(code);
        });
    });
}

async function getExperienceIndex() {
    return new Promise((resolve, reject) => {
        let output = "";
        const wei = spawn(
            'Get-WmiObject',
            ['-Class', 'Win32_WinSAT'],
            { shell: 'powershell.exe', windowsHide: true });

        wei.stderr.on('data', (data) => reject(data));

        wei.stdout.on('data', (data) => output += data.toString());

        wei.on('close', async (code) => {
            const experience = await mapWinsatToExperienceIndex(output);
            return resolve(experience);
        });
    });
}

async function mapWinsatToExperienceIndex(winsatOutput) {
    const fields = {
        'CPUScore': 'cpu',
        'D3DScore': 'gaming',
        'DiskScore': 'disk',
        'GraphicsScore': 'graphics',
        'MemoryScore': 'memory',
        'WinSPRLevel': 'base'
    };

    const outputLines = winsatOutput.split('\r\n');
    const properties = outputLines.filter(item => item.split(':')[0].trim() in fields);

    console.log(properties);

    const experience = {};

    properties.map(item => {
        const fieldKey = fields[item.split(':')[0].trim()];
        const value = item.split(':')[1].trim();

        experience[fieldKey] = parseFloat(value.replace(',', '.'));
    });

    console.log(experience);

    return experience;
}

async function getAssessmentDate() {
    return new Promise((resolve, reject) => {
        var dir = 'c:\\windows\\performance\\winsat\\datastore';

        fs.readdir(dir, function (err, files) {
            if (err) reject(err);

            files = files.map(fileName => {
                file = fs.statSync(dir + '\\' + fileName);

                return {
                    name: fileName,
                    modifyTimestamp: file.mtime.getTime(),
                    modifyDatetime: file.mtime
                };
            }).sort((a, b) => b.modifyTimestamp - a.modifyTimestamp);

            resolve(files.length > 0 ? files[0].modifyDatetime : null);
        });
    });
}

async function getScoreLimits() {
    return new Promise((resolve, reject) => {
        let output = "";
        const wei = spawn(
            '(Get-WmiObject -Class Win32_OperatingSystem | ForEach-Object -MemberName Caption)',
            [],
            { shell: 'powershell.exe', windowsHide: true });

        wei.stderr.on('data', (data) => reject(data));

        wei.stdout.on('data', (data) => output += data.toString());

        wei.on('close', async (code) => {
            let osLimits = { from: 1, to: 0 };

            if (output.toLowerCase().includes('Vista')) {
                osLimits.to = 5.9;
            }
            else if (output.toLowerCase().includes('7')) {
                osLimits.to = 7.9;
            }
            else {
                osLimits.to = 9.9;
            }

            resolve(osLimits);
        });
    });
}

exports.runAssessmentTool = runAssessmentTool;
exports.getExperienceIndex = getExperienceIndex;
exports.getAssessmentDate = getAssessmentDate;
exports.getScoreLimits = getScoreLimits;