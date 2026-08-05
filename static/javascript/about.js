// Benefits carousel cycles .carousel-slide via .is-active
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('benefits-carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevButton = carousel.querySelector('.carousel-arrow-prev');
    const nextButton = carousel.querySelector('.carousel-arrow-next');

    let currentIndex = 0;

    function showSlide(index) {
        slides[currentIndex].classList.remove('is-active');
        currentIndex = (index + slides.length) % slides.length;
        slides[currentIndex].classList.add('is-active');
    }

    prevButton.addEventListener('click', () => showSlide(currentIndex - 1));
    nextButton.addEventListener('click', () => showSlide(currentIndex + 1));
});

// Story photo lightbox, a single shared modal - reusable for all three photos for .about-story
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('story-lightbox');
    if (!overlay) return;

    const image = overlay.querySelector('.lightbox-image');
    const captionText = overlay.querySelector('.lightbox-caption-text');
    const closeButton = overlay.querySelector('.lightbox-close');
    const storyImages = document.querySelectorAll('.story-images img');

    // Tracks whichever photo was clicked
    let lastFocused = null;

    // Listens for Escape while the modal is open 
    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    }

    // Fills the shared modal with the clicked photo's image and caption, shows it, and moves focus in
    function openLightbox(img) {
        lastFocused = img;
        image.src = img.src;
        image.alt = img.alt;
        captionText.textContent = img.closest('figure').querySelector('figcaption').textContent;
        overlay.classList.add('is-open');
        closeButton.focus();
        document.addEventListener('keydown', handleKeydown);
    }

    // Modal relies on those photos having tabindex="0" in about.html
    function closeLightbox() {
        overlay.classList.remove('is-open');
        document.removeEventListener('keydown', handleKeydown);
        if (lastFocused) {
            lastFocused.focus();
        }
    }

    // Click or keyboard both open the same modal
    storyImages.forEach((img) => {
        img.addEventListener('click', () => openLightbox(img));
        img.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(img);
            }
        });
    });

    closeButton.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeLightbox();
        }
    });
});
