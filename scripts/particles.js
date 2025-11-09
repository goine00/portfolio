const container = document.getElementById('particles_container');
const particle_count = 20;

for (let i = 0; i < particle_count; i++) {
    const div = document.createElement('div');
    div.classList.add('particle');

    const left = Math.random() * 100;
    const top = Math.random() * 100;
    div.style.left = `${left}%`;
    div.style.top = `${top}%`;

    const duration = 12 + Math.random() * 8;
    div.style.animationDuration = `${duration}s`;

    const delay = Math.random() * 5;
    div.style.animationDelay = `${delay}s`;

    container.appendChild(div);
}
