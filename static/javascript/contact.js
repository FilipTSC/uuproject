$(function () {
  const storageKey = 'uuFakeGymContactMessages';
  const form = $('#contactForm');
  const statusBox = $('#formStatus');
  const savedMessages = $('#savedMessages');

  function getStoredMessages() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveStoredMessages(messages) {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  function renderMessages() {
    const messages = getStoredMessages();

    if (!messages.length) {
      savedMessages.html('<li class="empty-state">No enquiries yet. Your first message will appear here.</li>');
      return;
    }

    const latest = messages.slice().reverse();
    savedMessages.empty();

    latest.forEach((entry) => {
      const item = $('<li class="saved-item"></li>');
      item.html(
        `<div><strong>${escapeHtml(entry.name)}</strong><p>${escapeHtml(entry.subject)}</p></div><span>${formatDate(entry.timestamp)}</span>`
      );
      savedMessages.append(item);
    });
  }

  function clearErrors() {
    $('.field-error').text('');
    $('.field-input').removeClass('is-invalid');
  }

  function showError(fieldName, message) {
    $(`[name="${fieldName}"]`).addClass('is-invalid');
    $(`[data-error-for="${fieldName}"]`).text(message);
  }

  function validateField(fieldName, value) {
    const trimmed = value.trim();

    switch (fieldName) {
      case 'name':
        if (!trimmed) return 'Please enter your name.';
        if (trimmed.length < 2) return 'Please enter at least 2 characters for your name.';
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(trimmed)) return 'Please use letters, spaces, apostrophes, or hyphens only.';
        return true;
      case 'email':
        if (!trimmed) return 'Please enter your email address.';
        if (/\s/.test(trimmed)) return 'Please remove any spaces from your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address such as name@example.com.';
        return true;
      case 'subject':
        if (!trimmed) return 'Please enter a subject.';
        if (trimmed.length < 3) return 'Please use at least 3 characters for the subject.';
        if (!/[A-Za-z]/.test(trimmed)) return 'Please include some letters in the subject.';
        return true;
      case 'message':
        if (!trimmed) return 'Please write a short message.';
        if (trimmed.length < 10) return 'Please write at least 10 characters so we can help you properly.';
        return true;
      default:
        return true;
    }
  }

  function validateForm() {
    let isValid = true;
    const fields = ['name', 'email', 'subject', 'message'];

    clearErrors();

    fields.forEach((fieldName) => {
      const value = form.find(`[name="${fieldName}"]`).val();
      const result = validateField(fieldName, value);

      if (result !== true) {
        isValid = false;
        showError(fieldName, result);
      }
    });

    return isValid;
  }

  $('.field-input').on('input', function () {
    const fieldName = $(this).attr('name');
    const value = $(this).val();
    const result = validateField(fieldName, value);

    if (result === true) {
      $(`[data-error-for="${fieldName}"]`).text('');
      $(this).removeClass('is-invalid');
    } else {
      $(this).addClass('is-invalid');
      $(`[data-error-for="${fieldName}"]`).text(result);
    }
  });

  form.on('reset', function () {
    clearErrors();
    statusBox.removeClass('success error').text('');
  });

  form.on('submit', function (event) {
    event.preventDefault();

    if (!validateForm()) {
      statusBox.removeClass('success').addClass('error').text('Please correct the highlighted fields.');
      return;
    }

    const messageData = {
      name: form.find('[name="name"]').val().trim(),
      email: form.find('[name="email"]').val().trim(),
      subject: form.find('[name="subject"]').val().trim(),
      message: form.find('[name="message"]').val().trim(),
      timestamp: new Date().toISOString()
    };

    const storedMessages = getStoredMessages();
    storedMessages.push(messageData);
    saveStoredMessages(storedMessages);
    renderMessages();

    form[0].reset();
    clearErrors();
    statusBox.removeClass('error').addClass('success').text(`Thanks, ${messageData.name}! Your mock enquiry has been stored.`);
  });

  renderMessages();
});
