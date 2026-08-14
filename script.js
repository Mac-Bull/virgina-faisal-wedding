const weddingDate = new Date('2026-10-02T08:00:00+07:00').getTime();
function updateCountdown() {
  const gap = Math.max(0, weddingDate - Date.now());
  const units = {
    days: Math.floor(gap / 86400000),
    hours: Math.floor(gap / 3600000) % 24,
    minutes: Math.floor(gap / 60000) % 60,
    seconds: Math.floor(gap / 1000) % 60
  };
  Object.entries(units).forEach(([key, value]) => {
    document.querySelector(`#${key}`).textContent = String(value).padStart(2, '0');
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible'));
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const galleryImages = window.WEDDING_GALLERY;
const galleryStage = document.querySelector('.gallery-stage');
const featuredImage = document.querySelector('.featured');
const thumbnailsContainer = document.querySelector('.gallery-thumbs');
let galleryIndex = galleryImages.findIndex(image => image.src.toLowerCase().endsWith('ben_3138.webp'));
if (galleryIndex < 0) galleryIndex = 0;
let galleryDirection = 1;
let galleryTransitionTimer;

galleryImages.forEach((image, index) => {
  const button = document.createElement('button');
  button.className = 'gallery-thumb';
  button.type = 'button';
  button.dataset.galleryIndex = index;
  button.innerHTML = `<img src="${image.src}" alt="${image.alt}" loading="lazy">`;
  thumbnailsContainer.append(button);
});
const galleryThumbs = [...document.querySelectorAll('.gallery-thumb')];

function showGalleryImage(index, shouldScrollThumbnail = true) {
  const oldIndex = galleryIndex;
  galleryIndex = (index + galleryImages.length) % galleryImages.length;
  galleryDirection = index >= oldIndex ? 1 : -1;
  const animationClass = galleryDirection > 0 ? 'changing-next' : 'changing-previous';
  clearTimeout(galleryTransitionTimer);
  featuredImage.classList.remove('changing-next', 'changing-previous');
  featuredImage.classList.add(animationClass);
  galleryTransitionTimer = setTimeout(() => {
    featuredImage.src = galleryImages[galleryIndex].src;
    featuredImage.alt = galleryImages[galleryIndex].alt;
    featuredImage.classList.remove(animationClass);
  }, 180);
  galleryThumbs.forEach((thumb, thumbIndex) => {
    thumb.classList.toggle('active', thumbIndex === galleryIndex);
    thumb.setAttribute('aria-pressed', String(thumbIndex === galleryIndex));
  });
  if (shouldScrollThumbnail) {
    galleryThumbs[galleryIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

galleryThumbs.forEach(thumb => thumb.addEventListener('click', () => {
  showGalleryImage(Number(thumb.dataset.galleryIndex));
}));
document.querySelector('.gallery-arrow.previous').addEventListener('click', event => {
  event.stopPropagation();
  showGalleryImage(galleryIndex - 1);
});
document.querySelector('.gallery-arrow.next').addEventListener('click', event => {
  event.stopPropagation();
  showGalleryImage(galleryIndex + 1);
});

let swipeStart = null;
galleryStage.addEventListener('pointerdown', event => {
  if (event.target.closest('.gallery-arrow')) return;
  swipeStart = event.clientX;
  galleryStage.setPointerCapture(event.pointerId);
});
galleryStage.addEventListener('pointerup', event => {
  if (swipeStart === null) return;
  const distance = event.clientX - swipeStart;
  if (Math.abs(distance) > 45) showGalleryImage(galleryIndex + (distance < 0 ? 1 : -1));
  swipeStart = null;
});
galleryStage.addEventListener('pointercancel', () => {
  swipeStart = null;
});
showGalleryImage(galleryIndex, false);

const weddingMusic = document.querySelector('#weddingMusic');
const musicControl = document.querySelector('#musicControl');
const openInvitation = document.querySelector('#openInvitation');
const countdown = document.querySelector('#countdown');
const scrollCue = document.querySelector('.scroll-cue');
let musicHasStarted = false;

function updateMusicControl() {
  const isPlaying = !weddingMusic.paused;
  musicControl.classList.toggle('playing', isPlaying);
  musicControl.setAttribute('aria-pressed', String(isPlaying));
  musicControl.setAttribute('aria-label', isPlaying ? 'Jeda musik' : 'Putar musik');
}

async function startWeddingMusic() {
  try {
    await weddingMusic.play();
    musicHasStarted = true;
    updateMusicControl();
    return true;
  } catch {
    return false;
  }
}

musicControl.addEventListener('click', async event => {
  event.stopPropagation();
  if (weddingMusic.paused) await startWeddingMusic();
  else weddingMusic.pause();
  updateMusicControl();
});
weddingMusic.addEventListener('play', updateMusicControl);
weddingMusic.addEventListener('pause', updateMusicControl);

openInvitation.addEventListener('click', async () => {
  await startWeddingMusic();
  document.body.classList.remove('invitation-locked');
  openInvitation.hidden = true;
  countdown.hidden = false;
  scrollCue.hidden = false;
});

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
