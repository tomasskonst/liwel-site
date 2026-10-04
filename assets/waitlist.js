/* Waitlist form. Posts to /api/waitlist (a Vercel function that adds the contact to Brevo). */
document.addEventListener('DOMContentLoaded', function () {
  var $ = function (id) { return document.getElementById(id); };
  var nameEl = $('wl-name'), emailEl = $('wl-email'), countryEl = $('wl-country'), consentEl = $('wl-consent');
  var btn = $('wl-submit'), honey = $('wl-company');
  var refreshLabel = null;

  startLiwelJarWhenVisible($('jar'), function () {
    var n = (nameEl.value || '').trim();
    return n ? n : 'Your name';
  }, function (r) { refreshLabel = r; });

  nameEl.addEventListener('input', function () { if (refreshLabel) { refreshLabel(); } });
  emailEl.addEventListener('input', function () { $('wl-email-err').hidden = true; emailEl.style.borderColor = '#D5D8D3'; });
  consentEl.addEventListener('change', function () { $('wl-consent-err').hidden = true; });

  function submit() {
    var email = emailEl.value.trim();
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    $('wl-email-err').hidden = validEmail;
    emailEl.style.borderColor = validEmail ? '#D5D8D3' : '#A3261B';
    $('wl-consent-err').hidden = consentEl.checked;
    $('wl-send-err').hidden = true;
    if (!validEmail) { emailEl.focus(); return; }
    if (!consentEl.checked) { consentEl.focus(); return; }

    btn.disabled = true; btn.style.opacity = '0.6'; btn.textContent = 'Joining…';
    fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: nameEl.value.trim(), email: email, country: countryEl.value,
        consent: true, company: honey ? honey.value : ''
      })
    }).then(function (res) {
      if (!res.ok) { throw new Error('status ' + res.status); }
      var first = nameEl.value.trim();
      $('wl-thanks').textContent = first ? 'You\u2019re on the list, ' + first + '.' : 'You\u2019re on the list.';
      $('wl-email-echo').textContent = email;
      $('wl-form-wrap').hidden = true;
      $('wl-done').hidden = false;
      $('wl-thanks').focus();
    }).catch(function () {
      $('wl-send-err').hidden = false;
    }).then(function () {
      btn.disabled = false; btn.style.opacity = ''; btn.textContent = 'Join the waitlist';
    });
  }
  btn.addEventListener('click', submit);
  [nameEl, emailEl].forEach(function (el) {
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  });
});
