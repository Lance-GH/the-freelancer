const form = document.getElementById('uploadForm');
const out = document.getElementById('out');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('file', document.getElementById('fileInput').files[0]);

    try {
        const res = await fetch('/upload', { method: 'POST', body: fd });
        const data = await res.json();
        out.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        out.textContent = 'Error: ' + err.message;
    }
});