"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const labelInput = document.getElementById('labelInput');
const imageGallery = document.getElementById('imageGallery');
uploadForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    e.preventDefault();
    const file = (_a = imageInput.files) === null || _a === void 0 ? void 0 : _a[0];
    const label = labelInput.value;
    if (!file || !label) {
        alert('Please choose image and add label');
        return;
    }
    const formData = new FormData();
    formData.append('image', file);
    formData.append('label', label);
    try {
        const res = yield fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        const result = yield res.json();
        if (res.ok) {
            displayImage(result.imageUrl, label);
            uploadForm.reset();
        }
        else {
            alert(result.error || 'Upload failed');
        }
    }
    catch (err) {
        alert('Network error. Please try again later.');
        console.error(err);
    }
}));
function displayImage(url, label) {
    const div = document.createElement('div');
    div.className = 'image-card';
    div.innerHTML = `<img src="${url}" alt="${label}" /><p>${label}</p>`;
    imageGallery.appendChild(div);
}
//# sourceMappingURL=script.js.map