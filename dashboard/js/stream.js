function showLiveSection() {
    // Hide map and inspections, show live stream
    document.querySelector('.map-container').style.display = 'none';
    document.getElementById('inspections-section').style.display = 'none';
    document.getElementById('live-section').style.display = 'block';
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-live').classList.add('active');
}

// Intercept map/inspections clicks to restore view
document.getElementById('nav-farm').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.map-container').style.display = 'block';
    document.getElementById('inspections-section').style.display = 'block';
    document.getElementById('live-section').style.display = 'none';
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-farm').classList.add('active');
});

async function startStream() {
    const url = document.getElementById('rtsp-url').value;
    if (!url) return alert("Please enter an RTSP URL or local file path.");

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first.");

    const formData = new FormData();
    formData.append("rtsp_url", url);

    try {
        const res = await fetch("http://localhost:8000/streams/start", {
            method: "POST",
            headers: { "Authorization": "Bearer " + token },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to start stream");
        }

        const data = await res.json();
        
        // Setup MJPEG feed
        const videoEl = document.getElementById('live-video');
        const placeholder = document.getElementById('stream-placeholder');
        
        // Browser natively supports multipart/x-mixed-replace in img src
        // But we need to pass auth if it was required. Since <img> can't send Auth headers easily,
        // we assume the stream endpoint isn't locked down for the PoC or we pass token in URL.
        // For now, let's just use the direct URL.
        videoEl.src = "http://localhost:8000" + data.feed_url;
        
        videoEl.style.display = 'block';
        placeholder.style.display = 'none';
        document.getElementById('stop-stream-btn').style.display = 'inline-block';

    } catch (err) {
        alert(err.message);
    }
}

function stopStream() {
    const videoEl = document.getElementById('live-video');
    const placeholder = document.getElementById('stream-placeholder');
    
    videoEl.src = "";
    videoEl.style.display = 'none';
    placeholder.style.display = 'block';
    document.getElementById('stop-stream-btn').style.display = 'none';
}
