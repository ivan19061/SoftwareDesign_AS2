const backendUrl = 'http://localhost:8100';

// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const imageSelect = document.getElementById('imageSelect');
const labelInput = document.getElementById('labelInput');
const addLabelBtn = document.getElementById('addLabelBtn');
const labelStatus = document.getElementById('labelStatus');
const imagesGrid = document.getElementById('imagesGrid');
const backToTopBtn = document.getElementById('backToTop');
const mainTitle = document.getElementById('main-title');

// 滾動狀態追蹤
let isScrolling = false;
let scrollTimeout = null;
let lastScrollPosition = 0;

// Initialize: Load images on page load
window.onload = function() {
  loadImages();
  setupBackToTop();
  setupSmoothScroll();
};

// ------------------- Helper Functions -------------------
// Show status message (success/error)
function showStatus(element, message, isError = false) {
  element.textContent = message;
  element.className = `status ${isError ? 'error' : 'success'}`;
  setTimeout(() => element.textContent = '', 5000);
}

// Load all images and render UI
function loadImages() {
  fetch(`${backendUrl}/api/image`)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch images');
      return res.json();
    })
    .then((images) => {
      renderImageGrid(images);
      updateImageSelect(images);
    })
    .catch((err) => {
      showStatus(uploadStatus, err.message, true);
      console.error('Load images error:', err);
    });
}

// Render image grid with labels and delete buttons
function renderImageGrid(images) {
  imagesGrid.innerHTML = '';
  if (images.length === 0) {
    imagesGrid.innerHTML = '<p class="text-center text-muted">No images uploaded yet. Upload your first image!</p>';
    return;
  }

  images.forEach((img) => {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const labels = img.labels ? img.labels.split(', ') : [];
    const labelIds = img.labelIds ? img.labelIds.split(', ') : [];
    
    const labelTags = labels.map((label, index) => `
      <span class="label-tag">
        <i class="bi bi-tag-fill"></i> ${label}
        <button class="delete-label-btn" 
                data-image-id="${img.id}" 
                data-label-id="${labelIds[index]}">
          ×
        </button>
      </span>
    `).join('');

    card.innerHTML = `
      <img src="${backendUrl}/${img.file_path.replace('backend/', '')}" alt="${img.filename}">
      <div class="card-body">
        <div class="labels">${labelTags || '<span class="text-muted">No labels yet</span>'}</div>
        <button class="btn btn-danger delete-image-btn" data-image-id="${img.id}">
          <i class="bi bi-trash"></i> Delete Image
        </button>
      </div>
    `;
    imagesGrid.appendChild(card);
  });

  attachDeleteEventListeners();
}

// Update image select dropdown
function updateImageSelect(images) {
  imageSelect.innerHTML = '<option value="">Select an uploaded image</option>';
  images.forEach((img) => {
    const option = document.createElement('option');
    option.value = img.id;
    option.textContent = img.filename;
    imageSelect.appendChild(option);
  });
}

// Attach click listeners to delete buttons
function attachDeleteEventListeners() {
  document.querySelectorAll('.delete-image-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget;
      const imageId = target.dataset.imageId;
      if (imageId && confirm('Are you sure you want to delete this image? This cannot be undone.')) {
        deleteImage(imageId);
      }
    });
  });

  document.querySelectorAll('.delete-label-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget;
      const imageId = target.dataset.imageId;
      const labelId = target.dataset.labelId;
      if (imageId && labelId) {
        deleteLabelFromImage(imageId, labelId);
      }
    });
  });
}

// ------------------- Core Functions -------------------
// Upload image
uploadBtn.addEventListener('click', () => {
  const file = imageUpload.files?.[0];
  if (!file) {
    showStatus(uploadStatus, 'Please select an image to upload.', true);
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  fetch(`${backendUrl}/api/image`, {
    method: 'POST',
    body: formData
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to upload image');
      return res.json();
    })
    .then((data) => {
      showStatus(uploadStatus, '✓ Image uploaded successfully!');
      loadImages();
    })
    .catch((err) => {
      showStatus(uploadStatus, err.message, true);
      console.error('Upload image error:', err);
    });
});

// Add label to image
addLabelBtn.addEventListener('click', () => {
  const selectedImageId = imageSelect.value;
  const labelText = labelInput.value.trim();

  if (!selectedImageId) {
    showStatus(labelStatus, 'Please select an image first.', true);
    return;
  }

  if (!labelText) {
    showStatus(labelStatus, 'Please enter a label.', true);
    return;
  }

  fetch(`${backendUrl}/api/image/${selectedImageId}/labels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ label: labelText })
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to add label');
      return res.json();
    })
    .then((data) => {
      showStatus(labelStatus, '✓ Label added successfully!');
      labelInput.value = '';
      loadImages();
    })
    .catch((err) => {
      showStatus(labelStatus, err.message, true);
      console.error('Add label error:', err);
    });
});

// Delete an image
function deleteImage(imageId) {
  fetch(`${backendUrl}/api/image/${imageId}`, {
    method: 'DELETE'
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to delete image');
      return res.json();
    })
    .then((data) => {
      showStatus(uploadStatus, '✓ Image deleted successfully!');
      loadImages();
    })
    .catch((err) => {
      showStatus(uploadStatus, err.message, true);
      console.error('Delete image error:', err);
    });
}

// Delete a label from an image
function deleteLabelFromImage(imageId, labelId) {
  fetch(`${backendUrl}/api/image/${imageId}/labels/${labelId}`, {
    method: 'DELETE'
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to delete label');
      return res.json();
    })
    .then((data) => {
      showStatus(labelStatus, '✓ Label deleted successfully!');
      loadImages();
    })
    .catch((err) => {
      showStatus(labelStatus, err.message, true);
      console.error('Delete label error:', err);
    });
}

// ------------------- 增強版返回頂端功能 -------------------
function setupBackToTop() {
  if (!backToTopBtn) {
    console.warn('Back to top button not found');
    return;
  }

  // 計算滾動進度
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    
    const progressRing = backToTopBtn.querySelector('.btn-progress');
    if (progressRing) {
      const rotation = -90 + (scrollPercentage / 100) * 360;
      progressRing.style.transform = `rotate(${rotation}deg)`;
    }
  }

  // 節流函數
  function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  // 滾動事件處理(使用節流優化性能)
  const handleScroll = throttle(() => {
    const scrollPosition = window.pageYOffset;
    const showThreshold = 300;

    // 更新滾動進度
    updateScrollProgress();

    // 顯示/隱藏按鈕
    if (scrollPosition > showThreshold) {
      if (!backToTopBtn.classList.contains('show')) {
        backToTopBtn.classList.add('show');
        
        // 首次出現時添加脈衝動畫
        if (!backToTopBtn.classList.contains('pulse')) {
          backToTopBtn.classList.add('pulse');
          setTimeout(() => {
            backToTopBtn.classList.remove('pulse');
          }, 3000);
        }
      }
    } else {
      backToTopBtn.classList.remove('show');
    }

    lastScrollPosition = scrollPosition;
  }, 100);

  // 監聽滾動事件
  window.addEventListener('scroll', handleScroll, { passive: true });

  // 點擊事件處理
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // 觸發波紋效果
    const ripple = backToTopBtn.querySelector('.btn-ripple');
    if (ripple) {
      ripple.style.width = '200px';
      ripple.style.height = '200px';
      ripple.style.opacity = '1';
      
      setTimeout(() => {
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.opacity = '0';
      }, 600);
    }

    // 滾動到主標題
    if (mainTitle) {
      mainTitle.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // 添加高亮動畫
      mainTitle.style.transform = 'scale(1.05)';
      mainTitle.style.transition = 'transform 0.3s ease';
      
      setTimeout(() => {
        mainTitle.style.transform = 'scale(1)';
      }, 300);
    } else {
      // 如果沒有主標題,滾動到頂部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });

  // 鍵盤支援(Enter 和 Space 鍵)
  backToTopBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      backToTopBtn.click();
    }
  });

  // 初始化時檢查滾動位置
  handleScroll();
}

// ------------------- 平滑滾動導航 -------------------
function setupSmoothScroll() {
  document.querySelectorAll('nav a').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      if (targetId) {
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // 添加高亮動畫
          targetElement.style.transform = 'scale(1.02)';
          targetElement.style.transition = 'transform 0.3s ease';
          
          setTimeout(() => {
            targetElement.style.transform = 'scale(1)';
          }, 300);
        }
      }
    });
  });
}
