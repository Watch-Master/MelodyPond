const audio = document.getElementById('audio-player'), 
      playlist = document.getElementById('playlist'), 
      progressBar = document.getElementById('progress-bar'), 
      progressContainer = document.getElementById('progress-container'),
      searchInput = document.getElementById('search-input'), 
      volSlider = document.getElementById('volume-slider'),
      playPauseBtn = document.getElementById('play-pause-btn'),
      currentTitle = document.getElementById('current-title');

let allSongs = [], filteredSongs = [], currentIndex = 0;

// 1. Fetch and Setup
fetch('songs.json')
    .then(res => res.json())
    .then(data => {
        allSongs = data;
        filteredSongs = [...allSongs];
        render(filteredSongs);
        
        // Load saved volume
        const savedVol = localStorage.getItem('vol');
        if (savedVol) {
            audio.volume = savedVol;
            volSlider.value = savedVol;
        }
    });

// 2. Render Playlist
function render(songs) {
    playlist.innerHTML = '';
    songs.forEach((songPath, index) => {
        const li = document.createElement('li');
        const fileName = songPath.split('/').pop().replace(/\.mp3$/i, '');
        const folderName = songPath.split('/')[0];
        
        li.className = (songPath === allSongs[currentIndex] && !audio.paused) ? 'active' : '';
        li.innerHTML = `
            <div class="song-info">
                <span class="song-name">${fileName}</span>
                <span class="folder-tag">${folderName}</span>
            </div>
        `;
        
        li.onclick = () => {
            // Find the true index in the master list
            currentIndex = allSongs.indexOf(songPath);
            playSong(currentIndex);
        };
        playlist.appendChild(li);
    });
}

// 3. Play Logic (Fixed for GitHub)
function playSong(index) {
    if (index < 0) index = allSongs.length - 1;
    if (index >= allSongs.length) index = 0;
    currentIndex = index;

    const rawPath = allSongs[currentIndex];
    // We encode the path but then fix the slashes so GitHub can find the folders
    const encodedPath = encodeURI(rawPath).replace(/#/g, '%23').replace(/\?/g, '%3F');
    
    audio.src = encodedPath;
    currentTitle.textContent = rawPath.split('/').pop();
    
    audio.play().catch(e => console.error("Playback failed:", e));
    render(filteredSongs);
}

// 4. Controls & Events
function togglePlay() { audio.paused ? audio.play() : audio.pause(); }
function skip(s) { if(!isNaN(audio.duration)) audio.currentTime += s; }

audio.onplay = () => playPauseBtn.textContent = '⏸';
audio.onpause = () => playPauseBtn.textContent = '▶';

audio.ontimeupdate = () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = (percent || 0) + '%';
    document.getElementById('current-time').textContent = format(audio.currentTime);
    document.getElementById('duration').textContent = format(audio.duration || 0);
};

audio.onended = () => playSong(currentIndex + 1);

function format(s) { 
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

// 5. Search Functionality
searchInput.oninput = (e) => {
    const term = e.target.value.toLowerCase();
    filteredSongs = allSongs.filter(s => s.toLowerCase().includes(term));
    render(filteredSongs);
};

// 6. Interaction
progressContainer.onclick = e => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pos * audio.duration;
};

volSlider.oninput = e => {
    audio.volume = e.target.value;
    localStorage.setItem('vol', e.target.value);
};

document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-mode');
};