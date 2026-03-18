// =====================================================
//  contact.js — Contact form (uses backend API)
// =====================================================

async function sendContactMessage() {
  const name    = document.getElementById('contactName').value.trim();
  const email   = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  const btn     = document.getElementById('contactSendBtn');

  if (!name || !email || !subject || !message) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  btn.disabled    = true;
  btn.innerHTML   = '<i class="fas fa-spinner fa-spin me-2"></i>Sending…';

  try {
    await API.contact.send(name, email, subject, message);

    // Clear form
    ['contactName','contactEmail','contactSubject','contactMessage']
      .forEach(id => document.getElementById(id).value = '');

    showToast('✅ Message sent! The team will respond soon.', 'success');

    if (typeof addMessage === 'function')
      addMessage(`📬 Message from ${name}: "${subject}"`, 'bot');

  } catch (err) {
    showToast('Failed to send: ' + err.message, 'error');
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Message';
  }
}
