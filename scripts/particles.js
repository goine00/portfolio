const container = document.getElementById('particles_container');
const particle_count = 20;

for (let i = 0; i < particle_count; i++) {
    const div = document.createElement('div');
    div.classList.add('particle');
    container.appendChild(div);
}