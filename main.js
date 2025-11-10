// Elements
const aboutCard = document.getElementById("about")
const projectsCard = document.getElementById("projects")
const handleText = document.getElementById("handle-text")
const toast = document.getElementById("toast")
const discordHandle = document.getElementById("discord-handle")
const toastDiscord = document.getElementById("toast-discord")
const audio = document.getElementById("audio")
const canvas = document.getElementById("visualizer")
const ctx = canvas.getContext("2d")
const particlesCanvas = document.getElementById("particles")
const particlesCtx = particlesCanvas.getContext("2d")
const avatarEl = document.querySelector(".avatar")

let audioContext
let analyser
let dataArray
let audioStarted = false
const tiltEnabled = false
let particles = []
let lastSpawn = 0
const maxParticles = 80
const particleSpawnIntervalMs = 200

// Hash routing
function navigateToHash() {
  const hash = window.location.hash || "#about"

  if (hash === "#about") {
    aboutCard.classList.add("active")
    aboutCard.setAttribute("aria-hidden", "false")
    projectsCard.classList.remove("active")
    projectsCard.setAttribute("aria-hidden", "true")
  } else if (hash === "#projects") {
    projectsCard.classList.add("active")
    projectsCard.setAttribute("aria-hidden", "false")
    aboutCard.classList.remove("active")
    aboutCard.setAttribute("aria-hidden", "true")
  }
}

// Initialize on load
window.addEventListener("load", () => {
  navigateToHash()
  initParticles()
  animateParticles()
})

// Listen to hash changes
window.addEventListener("hashchange", navigateToHash)

// Copy to clipboard
handleText.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("goine")
    toast.classList.add("show")
    setTimeout(() => {
      toast.classList.remove("show")
    }, 2000)
  } catch (err) {
    console.error("[v0] Failed to copy text:", err)
  }
})

// Copy Discord handle
discordHandle.addEventListener("click", async () => {
  try {
    const textToCopy = (discordHandle?.textContent || "").trim()
    await navigator.clipboard.writeText(textToCopy)
    toastDiscord.classList.add("show")
    setTimeout(() => {
      toastDiscord.classList.remove("show")
    }, 2000)
  } catch (err) {
    console.error("[v0] Failed to copy discord handle:", err)
  }
})

// 3D Tilt Effect
function handleTilt(e, card) {
  if (!tiltEnabled) return

  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const centerX = rect.width / 2
  const centerY = rect.height / 2

  const rotateX = ((y - centerY) / centerY) * -8
  const rotateY = ((x - centerX) / centerX) * 8

  card.style.transform = `translate(-50%, -50%) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
}

function resetTilt(card) {
  card.style.transform = "translate(-50%, -50%)"
}

if (tiltEnabled) {
  aboutCard.addEventListener("mousemove", (e) => handleTilt(e, aboutCard))
  aboutCard.addEventListener("mouseleave", () => resetTilt(aboutCard))
  projectsCard.addEventListener("mousemove", (e) => handleTilt(e, projectsCard))
  projectsCard.addEventListener("mouseleave", () => resetTilt(projectsCard))
}

// Audio initialization
function initAudio() {
  if (audioStarted) return

  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const source = audioContext.createMediaElementSource(audio)
  analyser = audioContext.createAnalyser()

  analyser.fftSize = 256
  const bufferLength = analyser.frequencyBinCount
  dataArray = new Uint8Array(bufferLength)

  source.connect(analyser)
  analyser.connect(audioContext.destination)

  audio.play().catch((err) => console.error("[v0] Audio playback failed:", err))
  audioStarted = true

  drawVisualizer()
}

// Start audio on first interaction
document.addEventListener("click", initAudio, { once: true })
document.addEventListener("touchstart", initAudio, { once: true })

// Audio Visualizer
function drawVisualizer() {
  requestAnimationFrame(drawVisualizer)

  if (!analyser) return

  analyser.getByteFrequencyData(dataArray)

  canvas.width = canvas.offsetWidth * window.devicePixelRatio
  canvas.height = canvas.offsetHeight * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

  const barCount = 80
  const barWidth = canvas.offsetWidth / barCount
  const centerX = canvas.offsetWidth / 2

  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor((i / barCount) * dataArray.length)
    const barHeight = (dataArray[dataIndex] / 255) * (canvas.offsetHeight * 0.7)

    const x = centerX + (i - barCount / 2) * barWidth
    const y = canvas.offsetHeight - barHeight

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(x, y, barWidth - 2, barHeight)
  }
}

// Particles
function initParticles() {
  resizeParticlesCanvas()
  particles = []
  for (let i = 0; i < maxParticles / 2; i++) {
    particles.push(createParticle(true))
  }
}

function resizeParticlesCanvas() {
  particlesCanvas.width = particlesCanvas.offsetWidth * window.devicePixelRatio
  particlesCanvas.height = particlesCanvas.offsetHeight * window.devicePixelRatio
  particlesCtx.setTransform(1, 0, 0, 1, 0, 0)
  particlesCtx.scale(window.devicePixelRatio, window.devicePixelRatio)
}

function createParticle(randomPos = false) {
  const speed = 0.2 + Math.random() * 0.6
  const size = 1 + Math.random() * 3
  const alpha = 0.25 + Math.random() * 0.35
  const x = randomPos ? Math.random() * particlesCanvas.offsetWidth : (Math.random() < 0.5 ? -10 : particlesCanvas.offsetWidth + 10)
  const y = randomPos ? Math.random() * particlesCanvas.offsetHeight : Math.random() * particlesCanvas.offsetHeight
  const angle = Math.random() * Math.PI * 2
  const vx = Math.cos(angle) * speed * 0.4
  const vy = Math.sin(angle) * speed * 0.4 - 0.1
  const hue = 210 + Math.random() * 60
  return { x, y, vx, vy, size, alpha, hue }
}

function animateParticles(timestamp = 0) {
  requestAnimationFrame(animateParticles)
  particlesCtx.clearRect(0, 0, particlesCanvas.offsetWidth, particlesCanvas.offsetHeight)

  if (!lastSpawn) lastSpawn = timestamp
  if (timestamp - lastSpawn > particleSpawnIntervalMs && particles.length < maxParticles) {
    particles.push(createParticle(false))
    lastSpawn = timestamp
  }

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.alpha *= 0.9995
    if (
      p.x < -20 ||
      p.x > particlesCanvas.offsetWidth + 20 ||
      p.y < -20 ||
      p.y > particlesCanvas.offsetHeight + 20 ||
      p.alpha < 0.08
    ) {
      particles[i] = createParticle(false)
      continue
    }
    particlesCtx.beginPath()
    particlesCtx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`
    particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    particlesCtx.fill()
  }
}

// Handle window resize for canvas
window.addEventListener("resize", () => {
  canvas.width = canvas.offsetWidth * window.devicePixelRatio
  canvas.height = canvas.offsetHeight * window.devicePixelRatio
  resizeParticlesCanvas()
})

// Start avatar spin on first hover/touch and keep it spinning
if (avatarEl) {
  const startSpin = () => {
    avatarEl.classList.add("spin")
  }
  avatarEl.addEventListener("mouseenter", startSpin, { once: true })
  avatarEl.addEventListener("touchstart", startSpin, { once: true, passive: true })
}
