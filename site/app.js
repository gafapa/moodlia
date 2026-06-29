const status = document.querySelector('.copy-status');

function showStatus(message) {
  status.textContent = message;
  status.classList.add('visible');
  window.clearTimeout(showStatus.timeout);
  showStatus.timeout = window.setTimeout(() => {
    status.classList.remove('visible');
  }, 1800);
}

async function copyTextFromTarget(targetId) {
  const target = document.getElementById(targetId);
  if (!target) {
    showStatus('Nothing to copy.');
    return;
  }

  const text = target.textContent.trim();

  try {
    await navigator.clipboard.writeText(text);
    showStatus('Commands copied.');
  } catch {
    showStatus('Clipboard is not available.');
  }
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-copy-target]');
  if (!button) {
    return;
  }

  copyTextFromTarget(button.dataset.copyTarget);
});
