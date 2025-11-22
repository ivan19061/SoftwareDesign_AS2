async function fetchImages() {
  const res = await fetch('/api/image');
  const images = await res.json();

  const gallery = document.getElementById('labelsGallery')!;
  gallery.innerHTML = '';

  images.forEach((img: any) => {
    const card = document.createElement('div');
    card.className = 'image-card';

    // 圖片
    const imageEl = document.createElement('img');
    imageEl.src = img.url;
    card.appendChild(imageEl);

    // 標籤區塊
    const labelsDiv = document.createElement('div');
    img.labels.forEach((label: string) => {
      const span = document.createElement('span');
      span.className = 'label-tag';
      span.textContent = label;

      const delBtn = document.createElement('button');
      delBtn.textContent = 'x';
      delBtn.onclick = async () => {
        await fetch(`/api/label/${img.id}/${label}`, { method: 'DELETE' });
        fetchImages();
      };

      span.appendChild(delBtn);
      labelsDiv.appendChild(span);
    });
    card.appendChild(labelsDiv);

    // 新增標籤輸入框
    const input = document.createElement('input');
    input.placeholder = 'Add label';
    card.appendChild(input);

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add';
    addBtn.onclick = async () => {
      if (input.value.trim()) {
        await fetch('/api/label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId: img.id, label: input.value.trim() })
        });
        input.value = '';
        fetchImages();
      }
    };
    card.appendChild(addBtn);

    gallery.appendChild(card);
  });
}

fetchImages();
