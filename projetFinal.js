const showFormBtn = document.getElementById('montrerFormulaire');
const form = document.getElementById('videoformulaire');
const annulerBtn = document.getElementById('annuler');
const videoList = document.getElementById('videolist');
const emptyMessage = document.getElementById('empty-message');
const table = document.getElementById('table');

const nomInput = document.getElementById('nom');
const urlInput = document.getElementById('url');
const dureeInput = document.getElementById('duree');
const favoriInput = document.getElementById('favori');

let edition = null;

showFormBtn.onclick = () => {
  form.classList.remove('d-none');
  // Affiche le message d'attente dans la zone vidéo
  document.getElementById('video-player-container').innerHTML = 'Appuyer le 💕💕pour jouer la vidéo ';
};

form.onsubmit = (e) => {
  e.preventDefault();
  clearValidation();

  const nom = nomInput.value.trim();
  const url = urlInput.value.trim();
  const duree = dureeInput.value.trim();
  const favori = favoriInput.checked;

  let hasError = false;

  if (!nom) {
    nomInput.classList.add('is-invalid');
    hasError = true;
  }
  if (!isValidURL(url)) {
    urlInput.classList.add('is-invalid');
    hasError = true;
  }
  if (!isValidTime(duree)) {
    dureeInput.classList.add('is-invalid');
    hasError = true;
  }

  if (hasError) return;

  if (edition) {
    // Mode édition : modifie la ligne existante
    edition.innerHTML = `
      <td>${nom}</td>
      <td>${duree}</td>
      <td><a href="${url}" target="_blank">${url}</a></td>
      <td>${favori ? '⭐' : ''}</td>
      <td><button type="button" class="play-btn" data-url="${url}">💕</button></td>
      <td><button type="button" class="edit-btn">✏️</button></td>
      <td><button type="submit"class="del-btn" >🚮</button></td>
    `;
    edition = null;
    updateTotalDuration();
  } else {
    // Mode ajout : ajoute une nouvelle ligne
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${nom}</td>
      <td>${duree}</td>
      <td><a href="${url}" target="_blank">${url}</a></td>
      <td>${favori ? '⭐' : ''}</td>
      <td><button type="button" class="play-btn" data-url="${url}">💕</button></td>
      <td><button type="button" class="edit-btn">✏️</button></td>
      <td><button type="submit"class="del-btn" >🚮</button></td>
    `;
    videoList.appendChild(tr);
    updateTotalDuration();
  }

  table.style.display = 'table';
  emptyMessage.style.display = 'none';

  form.reset();
  form.classList.add('d-none');
};


annulerBtn.onclick = () => {
  form.reset();
  form.classList.add('d-none');
  clearValidation();
  edition = null;
};




function clearValidation() {
  [nomInput, urlInput, dureeInput].forEach(input => {
    input.classList.remove('is-invalid');
  });
}


function isValidURL(str) {
  try {
    const url = new URL(str);
    // Vérifie que l'URL commence exactement par ce préfixe
    return url.href.startsWith("https://www.youtube.com/watch?v=");
  } catch {
    return false;
  }
}

function isValidTime(str) {
  return /^([0-1]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/.test(str);
}
// Fonction pour convertir une URL YouTube en URL d'embed
function getYoutubeEmbedUrl(url) {
  // On extrait l'identifiant de la vidéo
  const match = url.match(/[?&]v=([^&]+)/);
  if (match) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1`;
  }
  return null;
}

// Délégation d'événement pour tous les boutons "play"
videoList.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('play-btn')) {
    const url = e.target.getAttribute('data-url');
    const embedUrl = getYoutubeEmbedUrl(url);
    if (embedUrl) {
      document.getElementById('video-player-container').innerHTML = `
        <iframe 
          width="560" height="315"
          src="${embedUrl}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      `;
    }
  }
  if (e.target && e.target.classList.contains('edit-btn')) {
    // Trouve la ligne à éditer
    const tr = e.target.closest('tr');
    // Prend les valeurs de la ligne
    const tds = tr.querySelectorAll('td');
    nomInput.value = tds[0].textContent;
    dureeInput.value = tds[1].textContent;
    urlInput.value = tds[2].querySelector('a').getAttribute('href');
    favoriInput.checked = tds[3].textContent.trim() === '⭐';
    // Passe en mode édition
    edition = tr;
    form.classList.remove('d-none');
  }
  // Gestion du bouton suppression
  if (e.target && e.target.classList.contains('del-btn')) {
    const tr = e.target.closest('tr');
    // Ignore la ligne du total
    if (tr.id === 'total-duration-row') return;
    const nom = tr.querySelector('td').textContent;
    if (confirm(`Voulez-vous supprimer la vidéo "${nom}" ?`)) {
      tr.remove();
      updateTotalDuration();
      // Si plus aucune vidéo, cacher le tableau et afficher le message
      if (videoList.querySelectorAll('tr').length === 1 && document.getElementById('total-duration-row')) {
        table.style.display = 'none';
        emptyMessage.style.display = '';
        document.getElementById('total-duration-row').remove();
      }
    }
  }
});

// Convertit une durée "hh:mm:ss" en secondes
function timeToSeconds(timeStr) {
  const [h, m, s] = timeStr.split(':').map(Number);
  return (h * 3600) + (m * 60) + s;
}

// Convertit des secondes en "hh:mm:ss"
function secondsToTime(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
function updateTotalDuration() {
  let totalSeconds = 0;
  // Parcours toutes les lignes sauf la dernière (le total)
  for (const row of videoList.querySelectorAll('tr')) {
    // Ignore la ligne du total si elle existe déjà
    if (row.id === 'total-duration-row') continue;
    const dureeCell = row.children[1];
    if (dureeCell && /^\d{1,2}:\d{2}:\d{2}$/.test(dureeCell.textContent)) {
      totalSeconds += timeToSeconds(dureeCell.textContent);
    }
  }
  // Supprime l'ancienne ligne de total si elle existe
  const oldTotal = document.getElementById('total-duration-row');
  if (oldTotal) oldTotal.remove();
  // Ajoute la nouvelle ligne de total
  if (totalSeconds > 0) {
    const tr = document.createElement('tr');
    tr.id = 'total-duration-row';
    tr.innerHTML = `
      <td colspan="1" class="fw-bold">Total</td>
      <td colspan="6" class="fw-bold">${secondsToTime(totalSeconds)}</td>
    `;
    videoList.appendChild(tr);
  }
}

