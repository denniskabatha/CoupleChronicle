document.addEventListener('DOMContentLoaded', function() {
    // Date planner filter functionality
    const filterForm = document.getElementById('dateIdeaFilters');
    
    if (filterForm) {
        // Apply filters when form changes
        const filterInputs = filterForm.querySelectorAll('select, input');
        filterInputs.forEach(input => {
            input.addEventListener('change', function() {
                filterForm.submit();
            });
        });
        
        // Clear all filters
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Reset all form elements
                filterInputs.forEach(input => {
                    if (input.tagName === 'SELECT') {
                        input.selectedIndex = 0;
                    } else if (input.type === 'text' || input.type === 'search') {
                        input.value = '';
                    }
                });
                
                // Submit the form with cleared filters
                filterForm.submit();
            });
        }
    }
    
    // Date idea form functionality
    const dateIdeaForm = document.getElementById('dateIdeaForm');
    
    if (dateIdeaForm) {
        // Image preview
        const imageInput = document.getElementById('image');
        const imagePreview = document.getElementById('imagePreview');
        
        if (imageInput && imagePreview) {
            imageInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        imagePreview.innerHTML = `<img src="${e.target.result}" class="img-fluid rounded" alt="Image Preview">`;
                        imagePreview.style.display = 'block';
                    }
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
        
        // Form validation
        dateIdeaForm.addEventListener('submit', function(e) {
            const title = document.getElementById('title');
            const description = document.getElementById('description');
            
            let isValid = true;
            
            // Reset error messages
            document.querySelectorAll('.invalid-feedback').forEach(el => {
                el.style.display = 'none';
            });
            
            document.querySelectorAll('.is-invalid').forEach(el => {
                el.classList.remove('is-invalid');
            });
            
            // Validate title
            if (!title.value.trim()) {
                const errorMsg = title.nextElementSibling;
                title.classList.add('is-invalid');
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Please enter a title for your date idea.';
                isValid = false;
            }
            
            // Validate description
            if (!description.value.trim()) {
                const errorMsg = description.nextElementSibling;
                description.classList.add('is-invalid');
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Please provide a description for your date idea.';
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Date idea detail page
    const shareButtons = document.querySelectorAll('.share-btn');
    
    if (shareButtons.length > 0) {
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const platform = this.dataset.platform;
                const url = window.location.href;
                const title = document.title;
                
                let shareUrl;
                
                switch (platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                        break;
                    case 'pinterest':
                        const image = document.querySelector('.date-idea-img').src;
                        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(title)}`;
                        break;
                    case 'email':
                        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this date idea: ${url}`)}`;
                        break;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            });
        });
    }
    
    // Random date idea generator
    const randomIdeaBtn = document.getElementById('randomIdeaBtn');
    
    if (randomIdeaBtn) {
        randomIdeaBtn.addEventListener('click', function() {
            // Show loading state
            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Finding...';
            
            // Get all date idea cards
            const dateIdeas = document.querySelectorAll('.date-idea-card');
            
            if (dateIdeas.length > 0) {
                // Hide all date ideas first
                dateIdeas.forEach(card => {
                    card.style.display = 'none';
                });
                
                // Select a random date idea
                const randomIndex = Math.floor(Math.random() * dateIdeas.length);
                const selectedIdea = dateIdeas[randomIndex];
                
                // Highlight and show the selected idea
                selectedIdea.style.display = 'block';
                selectedIdea.classList.add('date-idea-highlight');
                
                // Scroll to the selected idea
                selectedIdea.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Reset button after a delay
                setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = 'Random Date Idea';
                    
                    // After some time, remove highlight and show all date ideas again
                    setTimeout(() => {
                        selectedIdea.classList.remove('date-idea-highlight');
                        dateIdeas.forEach(card => {
                            card.style.display = 'block';
                        });
                    }, 3000);
                }, 1000);
            } else {
                // No date ideas available
                this.disabled = false;
                this.innerHTML = 'No Date Ideas Available';
                
                setTimeout(() => {
                    this.innerHTML = 'Random Date Idea';
                }, 2000);
            }
        });
    }
});
