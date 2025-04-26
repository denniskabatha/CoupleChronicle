document.addEventListener('DOMContentLoaded', function() {
    // Gallery lightbox functionality
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            const imgTitle = this.querySelector('.overlay-title')?.textContent || '';
            const imgDesc = this.querySelector('.overlay-desc')?.textContent || '';
            
            openLightbox(imgSrc, imgTitle, imgDesc);
        });
    });
    
    // Function to open lightbox
    function openLightbox(imgSrc, imgTitle, imgDesc) {
        // Create the lightbox elements
        const lightbox = document.createElement('div');
        lightbox.className = 'gallery-lightbox';
        
        // Create the content container
        const content = document.createElement('div');
        content.className = 'lightbox-content';
        
        // Create the close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        
        // Create the image element
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = imgTitle;
        
        // Create the caption elements
        const caption = document.createElement('div');
        caption.className = 'lightbox-caption';
        
        if (imgTitle) {
            const title = document.createElement('h4');
            title.textContent = imgTitle;
            caption.appendChild(title);
        }
        
        if (imgDesc) {
            const desc = document.createElement('p');
            desc.textContent = imgDesc;
            caption.appendChild(desc);
        }
        
        // Add navigation buttons if there are multiple images
        if (galleryItems.length > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'lightbox-nav prev-btn';
            prevBtn.innerHTML = '&#10094;';
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'lightbox-nav next-btn';
            nextBtn.innerHTML = '&#10095;';
            
            // Find the current image index
            let currentIndex = Array.from(galleryItems).findIndex(item => 
                item.querySelector('img').src === imgSrc
            );
            
            // Previous button click handler
            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
                updateLightboxImage(currentIndex);
            });
            
            // Next button click handler
            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                currentIndex = (currentIndex + 1) % galleryItems.length;
                updateLightboxImage(currentIndex);
            });
            
            content.appendChild(prevBtn);
            content.appendChild(nextBtn);
            
            // Update lightbox image function
            function updateLightboxImage(index) {
                const newItem = galleryItems[index];
                const newImgSrc = newItem.querySelector('img').src;
                const newImgTitle = newItem.querySelector('.overlay-title')?.textContent || '';
                const newImgDesc = newItem.querySelector('.overlay-desc')?.textContent || '';
                
                img.src = newImgSrc;
                img.alt = newImgTitle;
                
                // Update caption
                caption.innerHTML = '';
                
                if (newImgTitle) {
                    const title = document.createElement('h4');
                    title.textContent = newImgTitle;
                    caption.appendChild(title);
                }
                
                if (newImgDesc) {
                    const desc = document.createElement('p');
                    desc.textContent = newImgDesc;
                    caption.appendChild(desc);
                }
            }
            
            // Add keyboard navigation
            document.addEventListener('keydown', function(e) {
                if (document.querySelector('.gallery-lightbox')) {
                    if (e.key === 'ArrowLeft') {
                        prevBtn.click();
                    } else if (e.key === 'ArrowRight') {
                        nextBtn.click();
                    } else if (e.key === 'Escape') {
                        closeLightbox();
                    }
                }
            });
        }
        
        // Add elements to the DOM
        content.appendChild(closeBtn);
        content.appendChild(img);
        content.appendChild(caption);
        lightbox.appendChild(content);
        document.body.appendChild(lightbox);
        
        // Add necessary styles
        document.body.style.overflow = 'hidden';
        
        // Add close functionality
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Function to close the lightbox
        function closeLightbox() {
            document.body.removeChild(lightbox);
            document.body.style.overflow = '';
        }
    }
    
    // Photo upload preview
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    
    if (photoInput && photoPreview) {
        photoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    photoPreview.innerHTML = `<img src="${e.target.result}" class="img-fluid rounded" alt="Photo Preview">`;
                    photoPreview.style.display = 'block';
                }
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Masonry layout for gallery (optional)
    const masonryContainer = document.querySelector('.gallery-masonry');
    if (masonryContainer && typeof Masonry !== 'undefined') {
        const masonry = new Masonry(masonryContainer, {
            itemSelector: '.gallery-item',
            columnWidth: '.gallery-sizer',
            percentPosition: true,
            gutter: 15
        });
        
        // Initialize Masonry after all images are loaded
        imagesLoaded(masonryContainer).on('progress', function() {
            masonry.layout();
        });
    }
    
    // Lazy loading for gallery images
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        const lazyImages = document.querySelectorAll('img.lazy-load');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy-load');
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove('lazy-load');
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img.lazy-load');
        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    }
});
