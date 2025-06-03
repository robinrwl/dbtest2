let currentSlide = 0;
let isAnimating = false;

// Get slider elements
const sliderTrack = document.getElementById('sliderTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const sliderItems = document.querySelectorAll('.slider-item');

// Calculate slides per view based on screen size
function getSlidesPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
}

// Update slider position
function updateSlider() {
    if (!sliderTrack) return;
    
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.max(0, sliderItems.length - slidesPerView);
    
    // Ensure current slide is within bounds
    if (currentSlide > maxSlide) {
        currentSlide = maxSlide;
    }
    
    const translateX = -(currentSlide * (100 / slidesPerView));
    sliderTrack.style.transform = `translateX(${translateX}%)`;
    
    // Update button states
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide >= maxSlide;
}

// Move slider
function moveSlider(direction) {
    if (isAnimating) return;
    
    isAnimating = true;
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.max(0, sliderItems.length - slidesPerView);
    
    currentSlide += direction;
    
    if (currentSlide < 0) currentSlide = 0;
    if (currentSlide > maxSlide) currentSlide = maxSlide;
    
    updateSlider();
    
    setTimeout(() => {
        isAnimating = false;
    }, 600);
}

// Auto advance slider
let autoSlideInterval;

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        const slidesPerView = getSlidesPerView();
        const maxSlide = Math.max(0, sliderItems.length - slidesPerView);
        
        if (currentSlide >= maxSlide) {
            currentSlide = 0;
        } else {
            currentSlide++;
        }
        updateSlider();
    }, 4000);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// Touch/Swipe functionality
let startX = 0;
let startY = 0;
let isDragging = false;

function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
    stopAutoSlide();
}

function handleTouchMove(e) {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = startX - currentX;
    const diffY = startY - currentY;
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        e.preventDefault();
        
        if (diffX > 0) {
            moveSlider(1);
        } else {
            moveSlider(-1);
        }
        
        isDragging = false;
        startAutoSlide();
    }
}

function handleTouchEnd() {
    isDragging = false;
    startAutoSlide();
}

// Enhanced Search functionality
function handleSearch() {
    const location = document.getElementById('location').value.trim();
    const propertyType = document.getElementById('property-type').value;
    const priceRange = document.getElementById('price-range').value;
    
    console.log('Search triggered:', {
        location,
        propertyType,
        priceRange
    });
    
    // Show loading state
    const searchBtn = document.getElementById('searchBtn');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<div class="spinner" style="width: 1rem; height: 1rem; margin: 0;"></div> Searching...';
    searchBtn.disabled = true;
    
    // Simulate search delay
    setTimeout(() => {
        // Filter properties
        filterProperties(location, propertyType, priceRange);
        
        // Reset button
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
        
        // Scroll to results
        const latestProperties = document.querySelector('.latest-properties');
        if (latestProperties) {
            latestProperties.scrollIntoView({ behavior: 'smooth' });
        }
    }, 1000);
}

// Enhanced Filter properties
function filterProperties(location, type, priceRange) {
    const propertyCards = document.querySelectorAll('.properties-grid .property-card');
    let visibleCount = 0;
    
    propertyCards.forEach((card, index) => {
        let show = true;
        
        if (location) {
            const cardLocation = card.querySelector('.property-location').textContent.toLowerCase();
            if (!cardLocation.includes(location.toLowerCase())) {
                show = false;
            }
        }
        
        if (type) {
            const cardType = card.querySelector('.property-type-badge').textContent.toLowerCase();
            if (!cardType.includes(type.toLowerCase())) {
                show = false;
            }
        }
        
        if (show) {
            card.style.display = 'block';
            card.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s forwards`;
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show results message
    const resultsMessage = document.createElement('div');
    resultsMessage.className = 'search-results-message';
    resultsMessage.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 1rem; margin: 2rem 0;">
            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Search Results</h3>
            <p style="font-size: 1.125rem;">Found ${visibleCount} properties matching your criteria</p>
        </div>
    `;
    
    // Remove existing message
    const existingMessage = document.querySelector('.search-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Add new message
    const propertiesGrid = document.querySelector('.properties-grid');
    if (propertiesGrid && propertiesGrid.parentNode) {
        propertiesGrid.parentNode.insertBefore(resultsMessage, propertiesGrid);
    }
}

// Enhanced Counter animation with better performance
function animateCounter(element, target, duration = 2500) {
    const start = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        // Format number based on target
        let displayValue;
        if (target >= 1000) {
            displayValue = current.toLocaleString() + '+';
        } else {
            displayValue = current + '%';
        }
        
        element.textContent = displayValue;
        
        // Add visual effect when reaching target
        if (progress === 1) {
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        } else {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Enhanced Intersection Observer for counter animation
function setupCounterAnimation() {
    const statsSection = document.getElementById('statsSection');
    if (!statsSection) return;
    
    let hasAnimated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                const counters = entry.target.querySelectorAll('.stat-number');
                
                counters.forEach((counter, index) => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    setTimeout(() => {
                        animateCounter(counter, target);
                    }, index * 200);
                });
                
                // Don't unobserve so it can re-trigger if user scrolls away and back
                setTimeout(() => {
                    hasAnimated = false;
                }, 5000);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    });
    
    observer.observe(statsSection);
}

// Enhanced smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced form validation
function validateSearchForm() {
    const location = document.getElementById('location').value.trim();
    const searchBtn = document.getElementById('searchBtn');
    
    if (location.length > 0 && location.length < 2) {
        // Show error message
        showNotification('Please enter at least 2 characters for location', 'error');
        return false;
    }
    
    return true;
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Enhanced scroll effects
function setupScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header hide/show on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add parallax effect to hero section
    const heroSection = document.querySelector('.hero-slider');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize slider
    updateSlider();
    startAutoSlide();
    
    // Add event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => moveSlider(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveSlider(1));
    
    // Enhanced search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (validateSearchForm()) {
                handleSearch();
            }
        });
    }
    
    // Add Enter key support for search
    const searchInputs = document.querySelectorAll('#location, #property-type, #price-range');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (validateSearchForm()) {
                    handleSearch();
                }
            }
        });
    });
    
    // Touch events for slider
    const sliderContainer = document.getElementById('heroSlider');
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        sliderContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        sliderContainer.addEventListener('touchend', handleTouchEnd);
        
        // Pause auto-slide on hover
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
    }
    
    // Setup enhanced counter animation
    setupCounterAnimation();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup lazy loading
    setupLazyLoading();
    
    // Setup scroll effects
    setupScrollEffects();
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateSlider();
        }, 250);
    });
    
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                moveSlider(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                moveSlider(1);
                break;
            case 'Home':
                e.preventDefault();
                currentSlide = 0;
                updateSlider();
                break;
            case 'End':
                e.preventDefault();
                const slidesPerView = getSlidesPerView();
                currentSlide = Math.max(0, sliderItems.length - slidesPerView);
                updateSlider();
                break;
        }
    });
    
    // Add fade-in animation to elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for fade-in animation
    document.querySelectorAll('.property-card, .category-card, .feature-card').forEach(el => {
        fadeInObserver.observe(el);
    });
    
    console.log('Enhanced PropertyHub website initialized successfully!');
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${Math.round(loadTime)}ms`);
});

// Export enhanced functions for external use
window.PropertyHub = {
    moveSlider,
    handleSearch,
    filterProperties,
    validateSearchForm,
    showNotification,
    animateCounter
};