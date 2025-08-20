export function toasty(message, redir) {
  Toastify({
    text: message,
    duration: 10000,
    gravity: 'top',
    position: 'left',
    close: true,
    style: {
      background: 'linear-gradient(rgba(225, 0, 105, 0.5))',
      fontFamily: 'systemUi, sans-serif',
      fontSize: '1.25rem',
      paddingBlock: '1.5rem',
    },
    callback: () => {
      if (!redir) {
        return;
      } else if (redir === 'shop') {
        window.location.href = '/shop.html';
      } else if (redir === 'home') {
        window.location.href = '/index.html';
      }
    },
  }).showToast();
  return;
}
