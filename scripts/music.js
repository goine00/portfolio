document.addEventListener('click', () => {
  const music = document.getElementById('bgMusic');
  if (music.paused) music.play().catch(err => console.log(err));
}, { once: true });
