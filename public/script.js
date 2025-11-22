const form = document.getElementById('upload-form');
    const status = document.getElementById('uploadStatus');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = '';
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      try {
        const fileInput = document.getElementById('imageUpload');
        const formData = new FormData(form);
        formData.append('image', fileInput.files[0]);
        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        form.reset();
        status.textContent = `Upload complete. Image ID: ${data.image_id}`;
      } catch (error) {
        status.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
      } finally {
        submitButton.disabled = false;
      }
    });