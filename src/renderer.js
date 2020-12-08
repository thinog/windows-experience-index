const { ipcRenderer, BrowserView } = require('electron');

let locale = 'pt-BR';
let loadingScore = false;
let lastScore;
let lastAssessmentDate;

const languageSelect = document.getElementById('language');
languageSelect.addEventListener('change', (event) => {
    locale = event.target.value;
    translate(locale);
});

document.addEventListener('DOMContentLoaded', () => {
    languageSelect.value = locale;
    translate(languageSelect.value);
});

const runButton = document.getElementById('run');
runButton.addEventListener('click', callAssessment);

const themeButton = document.getElementById('theme');
themeButton.addEventListener('click', changeTheme);

const minimize = document.getElementById('minimize');
minimize.addEventListener('click', () => ipcRenderer.send('app-minimize'));

const maximize = document.getElementById('maximize');
maximize.addEventListener('click', () => ipcRenderer.send('app-maximize'));

const close = document.getElementById('close');
close.addEventListener('click', () => ipcRenderer.send('app-close'));

const github = document.getElementById('github');
github.addEventListener('click', (event) => {
    event.preventDefault();
    ipcRenderer.send('open-github')
});

function callAssessment() {
    hideLoader(false);
    ipcRenderer.send('run-assessment');
}

function fillScore(score) {
    if (!score) return;

    lastScore = score;

    const elements = document.querySelectorAll('[data-score]');

    elements.forEach(element => {
        if (score['base'] === score[element.dataset.score]) {
            element.classList.add('grey-column', 'bold');
        }
        element.innerHTML = score[element.dataset.score].toLocaleString(locale, { maximumFractionDigits: 1 });
    });
}

function fillAssessmentDate(date) {
    if (!date) return;

    lastAssessmentDate = date;
    const element = document.getElementById('assessment-date');
    element.innerHTML = date.toLocaleString(locale);
}

function translate(lang) {
    const elements = document.querySelectorAll('[data-translation-key]');

    const translation = require(`${__dirname}/translations/${lang}.js`).translations;

    elements.forEach(element => {
        const key = element.dataset.translationKey;
        const text = key.split('.').reduce((object, prop) => object && object[prop], translation);
        element.innerHTML = text;
    });

    fillScore(lastScore);
    fillAssessmentDate(lastAssessmentDate);
}

function changeTheme(event) {
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark');
    } else {
        document.body.classList.add('dark');
    }
}

function hideLoader(hide = true) {
    const loader = document.getElementById('loader');
    console.log(loader)

    if (hide && !loader.classList.contains('hidden')) loader.classList.add('hidden');
    else loader.classList.remove('hidden');
}

ipcRenderer.on('assessment-done', (event, score) => {
    fillScore(score);
    hideLoader(true);
});

ipcRenderer.on('initial-score', (event, score) => {
    if (!score || score.baseScore == 0) {
        // abrir modal de confirmação de primeiro calculo
    }

    fillScore(score);
});

ipcRenderer.on('last-run-date', (event, date) => {
    fillAssessmentDate(date)
});