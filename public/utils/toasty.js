export function toasty(message, cb) {
  Toastify({
    text: message,
    duration: 10000,
    gravity: 'top',
    position: 'left',
    close: true,
    style: {
      background: 'linear-gradient(rgba(255, 188, 220, 0.5))',
      fontFamily: 'systemUi, sans-serif',
      fontSize: '1.25rem',
      paddingBlock: '1.5rem',
      borderRadius: '15px 0px 15px',
    },
    callback: () => {
      if (!cb) {
        return;
      } else if (cb === 'shop') {
        window.location.href = '/shop.html';
      } else if (cb === 'home') {
        window.location.href = '/index.html';
      } else if (cb === 'reload') {
        window.location.reload();
      } else if (cb === 'poly') {
        document
          .getElementById('product-dialog')
          .style.setProperty(
            '--clip-path-poly',
            'polygon(0 0, 0 0, 0 0, 0 100%, 100% 100%, 100% 0)',
          );
      }
    },
  }).showToast();
  return;
}
