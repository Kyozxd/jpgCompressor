'use strict';

/**
 * List of global variables
 */
let IMAGES = []; // input files
let NUMBER = 0; // number of images
let MAX_SIZE = 1000; // max size in pixels options
let QUALITY = 100; // quality option
let SIZE_BEFORE = 0; // sum of all image size in kb

/**
 *
 * @param {Blob} imageElement
 * @return {Promise<>}
 */
function compressOneImage(imageElement) {
    return new Promise(resolve => {
        let formData = new FormData();
        formData.append('file_upload', imageElement);
        formData.append('action', 'compress');
        formData.append('maxSize', MAX_SIZE);
        formData.append('quality', QUALITY);
        SIZE_BEFORE += imageElement.size;
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'controller.php');
        xhr.onload = () => {
            resolve();
        };
        xhr.send(formData);
    });
}

/**
 * Prepare constantes before compression
 *
 */
function compress() {
    MAX_SIZE = document.getElementById('maxSize').value;
    if (MAX_SIZE === '') {
        MAX_SIZE = 'existing';
    }
    // Echelle de compression en %
    QUALITY = [0, 10, 30, 60, 70, 90, 96, 97, 98, 99, 100][document.getElementById('quality').value];
    let loadingElement = document.getElementById('greenBar');
    let loadingTextElement = document.querySelector('#loading_div span');
    let imageElements = document.getElementById('files_multiple').files;
    if (imageElements.length === 0) {
        showErrorMessage('Aucune photo sélectionnée');
    } else if (imageElements.length > 100) {
        showErrorMessage('Le nombre de photos maximum est de 100');
    } else {
        compressRecursively(0, loadingElement, loadingTextElement, imageElements);
    }
}

/**
 *
 * @param {string} message
 */
function showErrorMessage(message) {
    let errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

/**
 *
 * @param {number} i - index
 * @param {HTMLElement} loadingElement
 * @param {Element} loadingTextElement
 * @param {[Blob]}imageElements
 */
function compressRecursively(i, loadingElement, loadingTextElement, imageElements) {
    if (i < NUMBER) {
        compressOneImage(imageElements[i]).then(() => {
                loadingElement.style.left = -300 + (300 / NUMBER * (i + 1)) + 'px';
                loadingTextElement.textContent = (i + 1) + '/' + NUMBER;
                document.querySelector('#fileList_ul li[data-line="' + i + '"]').classList.add('done');
                compressRecursively(i + 1, loadingElement, loadingTextElement, imageElements);
            }
        );
    } else {
        downloadZipFile();
    }
}

/**
 * Read HTML input and display file list
 *
 */
function getListOfPhotos() {
    refreshList();
    let imageElements = document.getElementById('files_multiple').files;
    NUMBER = imageElements.length
    document.querySelector('#loading_div span').textContent = 0 + '/' + NUMBER;
    let ulElement = document.getElementById('fileList_ul');
    ulElement.innerHTML = '';
    let line = 0;
    for (let imageElement of imageElements) {
        let liElement = document.createElement('li');
        liElement.textContent = '' + imageElement.name;
        liElement.dataset.line = '' + line;
        ulElement.appendChild(liElement);
        IMAGES.push(imageElement.name);
        line++;
    }
    document.getElementById('loading').classList.remove('hidden');
}

/**
 * Reset pixels size input if existing size is choose
 */
function toggleSizeInput() {
    let inputElement = document.getElementById('maxSize');
    if (!inputElement.disabled) {
        inputElement.value = '';
    } else {
        inputElement.value = 1920;
    }
    inputElement.disabled = !inputElement.disabled;
}

function refreshList() {
    let ulElement = document.getElementById('fileList_ul')
    ulElement.innerHTML = '<li>Aucun fichier sélectionné</li>';
    document.getElementById('greenBar').style.left = '-300px';
    document.getElementById('errorMessage').classList.add('hidden');
}

function emptyFileInput() {
    document.getElementById('files_multiple').value = '';
    IMAGES = [];
    SIZE_BEFORE = 0;
    refreshList();
}

/**
 * Download zip file and save statistiques
 *
 */
function downloadZipFile() {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'controller.php');
    xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
    xhr.onload = (data) => {
        let name = JSON.parse(data.target.response);
        console.log(name)
        downloadFile(name.split('/')[1], name);
    };
    xhr.send('action=downloadFiles&maxSize=' + MAX_SIZE + '&quality=' + QUALITY + '&sizeBefore=' + SIZE_BEFORE + '&images=' + JSON.stringify(IMAGES));
}

/**
 *
 * @param {string} fileName
 * @param {BinaryType} content
 */
function downloadFile(fileName, content) {
    let element = document.createElement('a');
    element.setAttribute('href', content);
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}