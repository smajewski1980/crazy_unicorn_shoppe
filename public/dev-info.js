// back to top button
const scrollDistance = () => window.scrollY;
const upArrow = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  let currentScroll = scrollDistance();
  if (currentScroll > 300) {
    upArrow.style.opacity = '1';
    upArrow.style.pointerEvents = 'auto';
  } else {
    upArrow.style.opacity = '0';
    upArrow.style.pointerEvents = 'none';
  }
});
