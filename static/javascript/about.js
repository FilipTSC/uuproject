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
