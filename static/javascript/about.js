// About page behaviour: benefits carousel + story-photo lightbox.
// Each feature is its own DOMContentLoaded block, guarded by an early return if its
// root element isn't on the page, so the two features stay independent of each other.

// Benefits carousel: cycles .carousel-slide via .is-active; the fade itself is a CSS transition in about.css
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

// Story-photo lightbox: a single shared modal (#story-lightbox in about.html) is reused for all
// three story photos rather than building one modal per photo — this keeps the markup small and
// means there's only one set of open/close listeners to maintain instead of three.
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('story-lightbox');
    if (!overlay) return;

    const image = overlay.querySelector('.lightbox-image');
    const captionText = overlay.querySelector('.lightbox-caption-text');
    const closeButton = overlay.querySelector('.lightbox-close');
    const storyImages = document.querySelectorAll('.story-images img');

    // Tracks whichever photo was clicked, so closing can return focus to it (accessibility requirement)
    let lastFocused = null;

    // Only listens for Escape while the modal is open (attached in openLightbox, detached in
    // closeLightbox) so it doesn't do anything when nothing is showing
    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    }

    // Fills the shared modal with the clicked photo's image + caption, shows it, and moves focus in
    function openLightbox(img) {
        lastFocused = img;
        image.src = img.src;
        image.alt = img.alt;
        captionText.textContent = img.closest('figure').querySelector('figcaption').textContent;
        overlay.classList.add('is-open');
        closeButton.focus();
        document.addEventListener('keydown', handleKeydown);
    }

    // Returning focus to the photo that opened the modal relies on those photos having
    // tabindex="0" in about.html — plain <img> elements aren't focusable otherwise
    function closeLightbox() {
        overlay.classList.remove('is-open');
        document.removeEventListener('keydown', handleKeydown);
        if (lastFocused) {
            lastFocused.focus();
        }
    }

    // Click or keyboard (Enter/Space, since the images are tabbable) both open the same modal
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

    // Closes only on a direct backdrop click — clicks inside the modal bubble up but never have
    // event.target === overlay, so this doesn't need a separate stopPropagation() on the modal
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeLightbox();
        }
    });
});
