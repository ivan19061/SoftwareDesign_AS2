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
function fetchImages() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch('/api/images');
            const data = yield res.json();
            console.log('📥 從 /api/images 取得的資料:', data);
            const container = document.getElementById('imageGallery');
            container.innerHTML = '';
            if (data.length === 0) {
                console.log('⚠️ 資料庫中沒有圖片記錄');
                container.innerHTML = '<p>目前沒有圖片。</p>';
                return;
            }
            data.forEach((image) => {
                console.log(`🖼️ 處理圖片 ID=${image.id}, URL=${image.url}, Label=${image.label}`);
                const card = document.createElement('div');
                card.className = 'image-card';
                const img = document.createElement('img');
                img.src = image.url;
                card.appendChild(img);
                const label = document.createElement('div');
                label.textContent = 'Label: ' + image.label;
                card.appendChild(label);
                const input = document.createElement('input');
                input.className = 'label-input';
                input.placeholder = 'Edit label';
                input.value = image.label;
                card.appendChild(input);
                const updateBtn = document.createElement('button');
                updateBtn.textContent = 'Update Label';
                updateBtn.style.marginRight = '6px';
                updateBtn.onclick = () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        console.log(`🔄 更新圖片 ID=${image.id} 為新標籤: ${input.value}`);
                        yield fetch('/api/label', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ imageId: image.id, label: input.value })
                        });
                        fetchImages();
                    }
                    catch (err) {
                        alert('更新失敗，請稍後再試');
                        console.error('❌ 更新標籤失敗:', err);
                    }
                });
                card.appendChild(updateBtn);
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete Image';
                deleteBtn.onclick = () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        console.log(`🗑️ 刪除圖片 ID=${image.id}`);
                        yield fetch(`/api/image/${image.id}`, { method: 'DELETE' });
                        fetchImages();
                    }
                    catch (err) {
                        alert('刪除失敗，請稍後再試');
                        console.error('❌ 刪除圖片失敗:', err);
                    }
                });
                card.appendChild(deleteBtn);
                container.appendChild(card);
            });
        }
        catch (err) {
            console.error('❌ 載入圖片失敗:', err);
            const container = document.getElementById('imageGallery');
            container.innerHTML = '<p>載入圖片時發生錯誤。</p>';
        }
    });
}
fetchImages();
//# sourceMappingURL=gallery.js.map