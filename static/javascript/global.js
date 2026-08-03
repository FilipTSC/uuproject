function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

$(function () {
  const navToggle = $('.nav-toggle');
  const siteNav = $('.site-nav');

  if (navToggle.length) {
    navToggle.on('click', function () {
      const isOpen = siteNav.hasClass('is-open');
      siteNav.toggleClass('is-open', !isOpen);
      navToggle.attr('aria-expanded', String(!isOpen));
    });

    $('.nav-links a').on('click', function () {
      if ($(window).width() <= 640) {
        siteNav.removeClass('is-open');
        navToggle.attr('aria-expanded', 'false');
      }
    });

    $(window).on('resize', function () {
      if ($(window).width() > 640) {
        siteNav.removeClass('is-open');
        navToggle.attr('aria-expanded', 'false');
      }
    });
  }
});
