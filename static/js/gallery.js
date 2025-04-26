document.addEventListener('DOMContentLoaded', function() {
    // Gallery lightbox functionality
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Check if this is a video or an image
            const isVideo = this.querySelector('video') !== null;
            
            if (isVideo) {
                const videoSrc = this.querySelector('source').src;
                const videoTitle = this.querySelector('.overlay-title')?.textContent || '';
                const videoDesc = this.querySelector('.overlay-desc')?.textContent || '';
                
                openLightbox(videoSrc, videoTitle, videoDesc, 'video');
            } else {
                const imgSrc = this.querySelector('img').src;
                const imgTitle = this.querySelector('.overlay-title')?.textContent || '';
                const imgDesc = this.querySelector('.overlay-desc')?.textContent || '';
                
                openLightbox(imgSrc, imgTitle, imgDesc, 'image');
            }
        });
    });
    
    // Function to open lightbox
    function openLightbox(mediaSrc, mediaTitle, mediaDesc, mediaType = 'image') {
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
        
        // Create media element (image or video)
        let mediaElement;
        
        if (mediaType === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.autoplay = true;
            mediaElement.style.maxWidth = '100%';
            mediaElement.style.maxHeight = '80vh';
            
            const source = document.createElement('source');
            source.src = mediaSrc;
            source.type = 'video/mp4';
            
            mediaElement.appendChild(source);
            mediaElement.innerHTML += 'Your browser does not support the video tag.';
        } else {
            mediaElement = document.createElement('img');
            mediaElement.src = mediaSrc;
            mediaElement.alt = mediaTitle;
        }
        
        // Create the caption elements
        const caption = document.createElement('div');
        caption.className = 'lightbox-caption';
        
        if (mediaTitle) {
            const title = document.createElement('h4');
            title.textContent = mediaTitle;
            caption.appendChild(title);
        }
        
        if (mediaDesc) {
            const desc = document.createElement('p');
            desc.textContent = mediaDesc;
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
            
            // Find the current media index
            let currentIndex;
            if (mediaType === 'video') {
                currentIndex = Array.from(galleryItems).findIndex(item => 
                    item.querySelector('video source') && item.querySelector('video source').src === mediaSrc
                );
            } else {
                currentIndex = Array.from(galleryItems).findIndex(item => 
                    item.querySelector('img') && item.querySelector('img').src === mediaSrc
                );
            }
            
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
            
            // Update lightbox media function
            function updateLightboxImage(index) {
                const newItem = galleryItems[index];
                const isItemVideo = newItem.querySelector('video') !== null;
                
                // Remove existing media element
                if (content.contains(mediaElement)) {
                    content.removeChild(mediaElement);
                }
                
                // Create new media element
                if (isItemVideo) {
                    const videoSrc = newItem.querySelector('source').src;
                    const videoTitle = newItem.querySelector('.overlay-title')?.textContent || '';
                    const videoDesc = newItem.querySelector('.overlay-desc')?.textContent || '';
                    
                    // Create new video element
                    mediaElement = document.createElement('video');
                    mediaElement.controls = true;
                    mediaElement.autoplay = true;
                    mediaElement.style.maxWidth = '100%';
                    mediaElement.style.maxHeight = '80vh';
                    
                    const source = document.createElement('source');
                    source.src = videoSrc;
                    source.type = 'video/mp4';
                    
                    mediaElement.appendChild(source);
                    mediaElement.innerHTML += 'Your browser does not support the video tag.';
                    
                    // Update caption
                    caption.innerHTML = '';
                    
                    if (videoTitle) {
                        const title = document.createElement('h4');
                        title.textContent = videoTitle;
                        caption.appendChild(title);
                    }
                    
                    if (videoDesc) {
                        const desc = document.createElement('p');
                        desc.textContent = videoDesc;
                        caption.appendChild(desc);
                    }
                } else {
                    const imgSrc = newItem.querySelector('img').src;
                    const imgTitle = newItem.querySelector('.overlay-title')?.textContent || '';
                    const imgDesc = newItem.querySelector('.overlay-desc')?.textContent || '';
                    
                    // Create new image element
                    mediaElement = document.createElement('img');
                    mediaElement.src = imgSrc;
                    mediaElement.alt = imgTitle;
                    
                    // Update caption
                    caption.innerHTML = '';
                    
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
                }
                
                // Add the new media element after the close button
                content.insertBefore(mediaElement, caption);
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
        content.appendChild(mediaElement);
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
