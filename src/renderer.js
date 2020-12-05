const { ipcRenderer } = require('electron');

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

function callAssessment(){
    loadingScore = true;
    ipcRenderer.send('run-assessment');
}

function fillScore(score){
    if(!score) return;

    lastScore = score;
    
    const elements = document.querySelectorAll('[data-score]');

    elements.forEach(element => {
        element.innerHTML = score[element.dataset.score].toLocaleString(locale);
    });
}

function fillAssessmentDate(date) {
    if(!date) return;

    lastAssessmentDate = date;
    const element = document.getElementById('assessment-date');
    element.innerHTML = date.toLocaleString(locale);
}

function translate(lang){
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

ipcRenderer.on('assessment-done', (event, score) => {
    fillScore(score);
    loadingScore = false;
});

ipcRenderer.on('initial-score', (event, score) => {    
    if(!score || score.baseScore == 0) {
        // abrir modal de confirmação de primeiro calculo
    }
    
    fillScore(score);
});

ipcRenderer.on('last-run-date', (event, date) => fillAssessmentDate(date));