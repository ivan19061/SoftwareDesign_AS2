const backendUrl: string = 'http://localhost:3000';

// DOM Elements
const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
const uploadBtn = document.getElementById('uploadBtn') as HTMLButtonElement;
const uploadStatus = document.getElementById('uploadStatus') as HTMLDivElement;
const imageSelect = document.getElementById('imageSelect') as HTMLSelectElement;
const labelInput = document.getElementById('labelInput') as HTMLInputElement;
const addLabelBtn = document.getElementById('addLabelBtn') as HTMLButtonElement;
const labelStatus = document.getElementById('labelStatus') as HTMLDivElement;
const imagesGrid = document.getElementById('imagesGrid') as HTMLDivElement;
const backToTopBtn = document.getElementById('backToTop') as HTMLButtonElement;
const mainTitle = document.getElementById('main-title') as HTMLHeadingElement;

// Interfaces
interface Image {
  id: string;
  filename: string;
  file_path: string;
  labels?: string;
  labelIds?: string;
}

interface Label {
  id: string;
  name: string;
  image_id: string;
}

interface ApiResponse {
  message?: string;
  [key: string]: any;
}

// 滾動狀態追蹤
let isScrolling: boolean = false;
let scrollTimeout: number | null = null;
let lastScrollPosition: number = 0;

// Initialize: Load images on page load
window.onload = function(): void {
  loadImages();
  setupBackToTop();
  setupSmoothScroll();
};

// ------------------- Helper Functions -------------------
// Show status message (success/error)
function showStatus(element: HTMLElement, message: string, isError: boolean = false): void {
  element.textContent = message;
  element.className = `status ${isError ? 'error' : 'success'}`;
  setTimeout(() => element.textContent = '', 5000);
}

// Load all images and render UI
function loadImages(): void {
  fetch(`${backendUrl}/api/images`)
    .then((res: Response) => {
      if (!res.ok) throw new Error('Failed to fetch images');
      return res.json();
    })
    .then((images: Image[]) => {
      renderImageGrid(images);
      updateImageSelect(images);
    })
    .catch((err: Error) => {
      showStatus(uploadStatus, err.message, true);
      console.error('Load images error:', err);
    });
}

// Render image grid with labels and delete buttons
function renderImageGrid(images: Image[]): void {
  imagesGrid.innerHTML = '';
  if (images.length === 0) {
    imagesGrid.innerHTML = '<p class="text-center text-muted">No images uploaded yet. Upload your first image!</p>';
    return;
  }

  images.forEach((img: Image) => {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const labels: string[] = img.labels ? img.labels.split(', ') : [];
    const labelIds: string[] = img.labelIds ? img.labelIds.split(', ') : [];
    
    const labelTags: string = labels.map((label: string, index: number) => `
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
function updateImageSelect(images: Image[]): void {
  imageSelect.innerHTML = '<option value="">Select an uploaded image</option>';
  images.forEach((img: Image) => {
    const option = document.createElement('option');
    option.value = img.id;
    option.textContent = img.filename;
    imageSelect.appendChild(option);
  });
}

// Attach click listeners to delete buttons
function attachDeleteEventListeners(): void {
  document.querySelectorAll('.delete-image-btn').forEach((btn: Element) => {
    btn.addEventListener('click', (e: Event) => {
      const target = e.currentTarget as HTMLButtonElement;
      const imageId = target.dataset.imageId;
      if (imageId && confirm('Are you sure you want to delete this image? This cannot be undone.')) {
        deleteImage(imageId);
      }
    });
  });

  document.querySelectorAll('.delete-label-btn').forEach((btn: Element) => {
    btn.addEventListener('click', (e: Event) => {
      const target = e.currentTarget as HTMLButtonElement;
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
uploadBtn.addEventListener('click', (): void => {
  const file: File | undefined = imageUpload.files?.[0];
  if (!file) {
    showStatus(uploadStatus, 'Please select an image to upload.', true);
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  fetch(`${backendUrl}/api/images`, {
    method: 'POST',
    body: formData
  })
    .then((res: Response) => {
      if (!res.ok) throw new Error('Failed to upload image');
      return res.json();
    })
    .then((data: Image) => {
      showStatus(uploadStatus, '✓ Image uploaded successfully!');
      loadImages();
    })
    .catch((err: Error) => {
      showStatus(uploadStatus, err.message, true);
      console.error('Upload image error:', err);
    });
});

// Add label to image
addLabelBtn.addEventListener('click', (): void => {
  const selectedImageId: string = imageSelect.value;
  const labelText: string = labelInput.value.trim();

  if (!selectedImageId) {
    showStatus(labelStatus, 'Please select an image first.', true);
    return;
  }

  if (!labelText) {
    showStatus(labelStatus, 'Please enter a label.', true);
    return;
  }

  fetch(`${backendUrl}/api/images/${selectedImageId}/labels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ label: labelText })
  })
    .then((res: Response) => {
      if (!res.ok) throw new Error('Failed to add label');
      return res.json();
    })
    .then((data: Label) => {
      showStatus(labelStatus, '✓ Label added successfully!');
      labelInput.value = '';
      loadImages();
    })
    .catch((err: Error) => {
      showStatus(labelStatus, err.message, true);
      console.error('Add label error:', err);
    });
});

// Delete an image
function deleteImage(imageId: string): void {
  fetch(`${backendUrl}/api/images/${imageId}`, {
    method: 'DELETE'
  })
    .then((res: Response) => {
      if (!res.ok) throw new Error('Failed to delete image');
      return res.json();
    })
    .then((data: ApiResponse) => {
      showStatus(uploadStatus, '✓ Image deleted successfully!');
      loadImages();
    })
    .catch((err: Error) => {
      showStatus(uploadStatus, err.message, true);
      console.error('Delete image error:', err);
    });
}

// Delete a label from an image
function deleteLabelFromImage(imageId: string, labelId: string): void {
  fetch(`${backendUrl}/api/images/${imageId}/labels/${labelId}`, {
    method: 'DELETE'
  })
    .then((res: Response) => {
      if (!res.ok) throw new Error('Failed to delete label');
      return res.json();
    })
    .then((data: ApiResponse) => {
      showStatus(labelStatus, '✓ Label deleted successfully!');
      loadImages();
    })
    .catch((err: Error) => {
      showStatus(labelStatus, err.message, true);
      console.error('Delete label error:', err);
    });
}

// ------------------- 增強版返回頂端功能 -------------------
function setupBackToTop(): void {
  if (!backToTopBtn) {
    console.warn('Back to top button not found');
    return;
  }

  // 計算滾動進度
  function updateScrollProgress(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    
    const progressRing = backToTopBtn.querySelector('.btn-progress') as HTMLElement;
    if (progressRing) {
      const rotation = -90 + (scrollPercentage / 100) * 360;
      progressRing.style.transform = `rotate(${rotation}deg)`;
    }
  }

  // 節流函數
  function throttle(func: Function, delay: number): () => void {
    let lastCall = 0;
    return function(this: any, ...args: any[]) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  // 滾動事件處理（使用節流優化性能）
  const handleScroll = throttle((): void => {
    const scrollPosition: number = window.pageYOffset;
    const showThreshold: number = 300;

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
  backToTopBtn.addEventListener('click', (e: Event): void => {
    e.preventDefault();

    // 觸發波紋效果
    const ripple = backToTopBtn.querySelector('.btn-ripple') as HTMLElement;
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
      // 如果沒有主標題，滾動到頂部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });

  // 鍵盤支援（Enter 和 Space 鍵）
  backToTopBtn.addEventListener('keydown', (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      backToTopBtn.click();
    }
  });

  // 初始化時檢查滾動位置
  handleScroll();
}

// ------------------- 平滑滾動導航 -------------------
function setupSmoothScroll(): void {
  document.querySelectorAll('nav a').forEach((anchor: Element) => {
    anchor.addEventListener('click', function(this: HTMLAnchorElement, e: Event): void {
      e.preventDefault();
      const targetId: string | null = this.getAttribute('href');
      
      if (targetId) {
        const targetElement: HTMLElement | null = document.querySelector(targetId);
        
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