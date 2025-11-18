const uploadForm = document.getElementById('uploadForm') as HTMLFormElement;
const imageInput = document.getElementById('imageInput') as HTMLInputElement;
const labelInput = document.getElementById('labelInput') as HTMLInputElement;
const imageGallery = document.getElementById('imageGallery') as HTMLDivElement;

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = imageInput.files?.[0];
  const label = labelInput.value;

  if (!file || !label) {
    alert('Please choose image and add label');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('label', label);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    if (res.ok) {
      displayImage(result.imageUrl, label);
      uploadForm.reset();
    } else {
      alert(result.error || 'Upload failed');
    }
  } catch (err) {
    alert('Network error. Please try again later.');
    console.error(err);
  }
});

function displayImage(url: string, label: string) {
  const div = document.createElement('div');
  div.className = 'image-card';
  div.innerHTML = `<img src="${url}" alt="${label}" /><p>${label}</p>`;
  imageGallery.appendChild(div);
}