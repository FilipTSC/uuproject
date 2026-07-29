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
        return trimmed.length >= 2 || 'Please enter your name.';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || 'Please enter a valid email address.';
      case 'subject':
        return trimmed.length >= 3 || 'Please add a short subject.';
      case 'message':
        return trimmed.length >= 10 || 'Please share a little more detail.';
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
