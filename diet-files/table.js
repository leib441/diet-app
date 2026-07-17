document.addEventListener('DOMContentLoaded', async function () {

    await getTable();
    deleteData();
    showBtnClicked();
    showCommentInput();

    document.querySelector('.style-btn').addEventListener('click', async function (event) {
        event.preventDefault();
        const btn = document.querySelector('.style-btn');
        btn.innerHTML = btn.innerHTML === 'previous style' ? 'change style' : 'previous style';
        changeStyle();
    });

    document.querySelector('#submit').addEventListener('click', async function (event) {
        event.preventDefault();
        const date = document.querySelector('#date').value;
        const weight = document.querySelector('#weight').value;
        if (date && weight) {
            await sendData();
        } else {
            alert('Please Fill Out All Fields!');
        }
    });

    document.querySelectorAll('#search-btn, #search-weight-btn').forEach(btn => {
        btn.addEventListener('click', async function (event) {
            event.preventDefault();

            if (btn.id === 'search-btn') {
                const searchDate = document.querySelector('#search').value;
                searchDate ? await searchByDate() : console.log('no search entry!');
            } else {
                const searchWeight = document.querySelector('#search-weight').value;
                searchWeight ? await searchByWeight() : console.log('no search entry!');
            }
        });
    });
});

function showCommentInput() {
    document.querySelector('.commentBtn').addEventListener('click', function (event) {
        event.preventDefault();
        const commentInput = document.querySelector('#comment-input');
        commentInput.style.display = commentInput.style.display === 'block' ? 'none' : 'block';
    });
}

async function getTable() {
    const request = await fetch('/get', { method: 'get' });
    const result = await request.json();

    if (result.success) {
        const table = document.querySelector('#assignment-list');
        table.innerHTML = '';

        result.data.forEach(row => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</td>
                <td>${row.weight}</td>
                <td></td>
                <td></td>
                <td>${row.comment}</td>
                <td><button id="${row.id}" class="deleteBtn">Delete</button></td>
            `;
            table.appendChild(newRow);
        });

        calculations();

    } else {
        console.error('Failed to fetch data:', result.error);
    }
}

async function sendData() {
    const date = document.querySelector('#date').value;
    const weight = document.querySelector('#weight').value;
    const comment = document.querySelector('#comment').value;

    // Capture previous last weight BEFORE submitting
    let previousWeight = null;
    const existingRows = document.querySelectorAll('#assignment-list tr');
    if (existingRows.length > 0) {
        previousWeight = Number(existingRows[existingRows.length - 1].cells[1].textContent.trim());
    }

    if (date && weight) {
        const request = await fetch('/send', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, weight, comment })
        });

        const result = await request.json();

        if (result.success) {
            const table = document.querySelector('#assignment-list');
            table.innerHTML = '';

            result.data.forEach(row => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</td>
                    <td>${row.weight}</td>
                    <td></td>
                    <td></td>
                    <td>${row.comment}</td>
                    <td><button id="${row.id}" class="deleteBtn">Delete</button></td>
                `;
                table.appendChild(newRow);
            });

            calculations();
            showTable();

            const newWeight = Number(weight);
            if (previousWeight !== null && newWeight < previousWeight) {
                const lost = previousWeight - newWeight;
                showCelebration(lost);
            }

        } else {
            console.error('Failed to fetch data:', result.error);
        }

        document.querySelector('#weight').value = '';
        document.querySelector('#date').value = '';
        document.querySelector('#comment').value = '';
        document.querySelector('#comment-input').style.display = 'none';
    }
}

function changeStyle() {
    const link = document.querySelector('#main-style');
    link.href = link.href.includes('ai-style.css') ? 'style.css' : 'ai-style.css';
}

function showTable() {
    const myContainer = document.querySelector('.table-container');
    myContainer.style.display = 'block';
    myContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showBtnClicked() {
    document.querySelector('#show-btn').addEventListener('click', function (event) {
        event.preventDefault();
        const myContainer = document.querySelector('.table-container');
        myContainer.style.display = myContainer.style.display === 'block' ? 'none' : 'block';
        myContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function calculateTotalWeightLost() {
    const allRows = document.querySelectorAll('#assignment-list tr');
    if (allRows.length === 0) return;
    const startingWeight = Number(allRows[0].cells[1].textContent);

    allRows.forEach((row) => {
        const currentWeight = Number(row.cells[1].textContent);
        const weightLost = startingWeight - currentWeight;
        row.cells[3].textContent = `${weightLost.toFixed(1)}`;
    });
}

function calculateSinceLastWeight() {
    const allRows = document.querySelectorAll('#assignment-list tr');
    if (allRows.length === 0) return;
    for (let i = 0; i < allRows.length; i++) {
        if (i === 0) {
            allRows[i].cells[2].textContent = '0.0';
            continue;
        }
        const previousWeight = Number(allRows[i - 1].cells[1].textContent);
        const currentWeight = Number(allRows[i].cells[1].textContent);
        allRows[i].cells[2].textContent = (previousWeight - currentWeight).toFixed(1);
    }
}

async function searchByDate() {
    const request = await fetch('/get', { method: 'get' });
    const result = await request.json();

    if (result.success) {
        const searchInput = document.querySelector('#search').value;
        const table = document.querySelector('#assignment-list');
        table.innerHTML = '';
        for (let row of result.data) {
            if (new Date(row.date).toISOString().split('T')[0] === searchInput) {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</td>
                    <td>${row.weight}</td>
                    <td></td>
                    <td></td>
                    <td>${row.comment}</td>
                    <td><button id="${row.id}" class="deleteBtn">Delete</button></td>
                `;
                table.appendChild(newRow);
            }
        }
        document.querySelector('#search').value = '';
    } else {
        console.error('failed to fetch data');
    }
}

async function searchByWeight() {
    const request = await fetch('/get', { method: 'get' });
    const result = await request.json();

    if (result.success) {
        const searchInput = document.querySelector('#search-weight').value;
        const table = document.querySelector('#assignment-list');
        table.innerHTML = '';

        for (let row of result.data) {
            if (Number(row.weight) === Number(searchInput)) {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</td>
                    <td>${row.weight}</td>
                    <td></td>
                    <td></td>
                    <td>${row.comment}</td>
                    <td><button id="${row.id}" class="deleteBtn">Delete</button></td>
                `;
                table.appendChild(newRow);
            }
        }
        document.querySelector('#search-weight').value = '';
    } else {
        console.error('failed to fetch data');
    }
}

function deleteData() {
    const table = document.querySelector('#assignment-list');
    table.addEventListener('click', async function (event) {
        if (!event.target.classList.contains('deleteBtn')) return;
        event.preventDefault();

        const newId = event.target.getAttribute('id');
        const request = await fetch('/delete', {
            method: 'delete',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: newId })
        });

        const result = await request.json();
        if (result.success) {
            event.target.closest('tr').remove();
            calculations();
        } else {
            console.error('Delete failed');
        }
    });
}

function calculations() {
    calculateSinceLastWeight();
    calculateTotalWeightLost();
}

// ===================================================
// ✅ CELEBRATION / FIREWORKS FUNCTIONS
// ===================================================
let _fwInterval = null;
let _fwFrame = null;
const _fwParticles = [];

function showCelebration(lostAmount) {
    const overlay = document.getElementById('celebration-overlay');
    const text = document.getElementById('celebration-text');

    text.innerHTML = `You lost <strong style="color:#FFD700; font-size:1.8rem;">${lostAmount.toFixed(1)} lbs</strong> since last week!<br>Amazing work! 🔥`;
    overlay.classList.add('active');
    const canvas = document.getElementById('fireworks-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    _launchFireworks(canvas);

    // Auto-close after 9 seconds
    setTimeout(closeCelebration, 15000);
}

function closeCelebration() {
    document.getElementById('celebration-overlay').classList.remove('active');
    _stopFireworks();
}

function _launchFireworks(canvas) {
    const ctx = canvas.getContext('2d');
    _fwParticles.length = 0;
    _fwInterval = setInterval(() => _createBurst(canvas), 500);
    _createBurst(canvas);

    (function animate() {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = _fwParticles.length - 1; i >= 0; i--) {
            const p = _fwParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06;
            p.vx *= 0.99;
            p.life -= 0.016;
            p.radius *= 0.97;

            if (p.life <= 0) { _fwParticles.splice(i, 1); continue; }

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        _fwFrame = requestAnimationFrame(animate);
    })();
}

function _createBurst(canvas) {
    const colors = [
        '#FFD700', '#FF6347', '#00CED1', '#FF69B4',
        '#7FFF00', '#FF4500', '#1E90FF', '#FF1493',
        '#ADFF2F', '#FFA500', '#DA70D6', '#40E0D0'
    ];
    const x = 80 + Math.random() * (canvas.width - 160);
    const y = 60 + Math.random() * (canvas.height * 0.55);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = 90 + Math.floor(Math.random() * 50);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = 2.5 + Math.random() * 4.5;
        _fwParticles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color,
            life: 0.75 + Math.random() * 0.5,
            radius: 3 + Math.random() * 3.5
        });
    }
}

function _stopFireworks() {
    clearInterval(_fwInterval);
    cancelAnimationFrame(_fwFrame);
    _fwParticles.length = 0;
    const canvas = document.getElementById('fireworks-canvas');
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

