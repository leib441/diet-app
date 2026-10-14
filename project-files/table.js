let table;
let goal = '-';
let btn;
let allRows;

//all document
document.addEventListener('DOMContentLoaded', async function () {

    table = document.querySelector('#weight-loss-list');
    btn = document.querySelector('.scroll-table-btn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            btn.innerHTML = 'Home';
        } else {
            btn.innerHTML = 'Scroll To Table';
        }
    })

    scrollButton();
    changeStyle();
    scrollSummary();
    scrollSearch();
    await getTable(allRows);
    setGoal();
    clickUsername()
    submitForm();
    deleteData();
    search();
});


//settings
function changeStyle() {
    document.querySelector('#themeToggle').addEventListener('change', function () {
        document.body.classList.toggle('dark', this.checked);
    });
}
function scrollButton() {

    btn.addEventListener('click', (event) => {
        event.preventDefault();
        if (btn.innerHTML === 'Scroll To Table') {
            const myContainer = document.querySelector('.submit-button');
            myContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            const form = document.querySelector('.allPage')
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}
function scrollSummary() {
    document.querySelector('.summary').addEventListener('click', (event) => {
        event.preventDefault();
        const table = document.querySelector('.summary-area');
        table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
}
function scrollSearch() {
    document.querySelector('.scroll-search').addEventListener('click', (event) => {
        event.preventDefault();
        const searchArea = document.querySelector('.search-form');
        searchArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
}

function clickUsername() {
    const usernameBtn = document.querySelector('#login-btn');
    const confirmBtn = document.querySelector('#confirmLogOut');
    const cancelBtn = document.querySelector('#cancelLogOut');
    const dialog = document.querySelector('#logOutDialog');

    usernameBtn.addEventListener('click', () => {
        if (usernameBtn.textContent !== 'Log In') {
            dialog.showModal();
        } else {
            window.location.href = '/index.html'
        }

    })
    confirmBtn.addEventListener('click', async () => {
        await logOut();
        dialog.close();
    })
    cancelBtn.addEventListener('click', () => {
        dialog.close();
    })
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
}
async function logOut() {
    const request = await fetch('/auth/log-out', {
        method: 'post',
        credentials: 'include'
    })
    const result = await request.json();
    if (result.success) {
        window.location.href = '/index.html'
    }
}

//form
function setGoal() {
    document.querySelector('.set-goal-btn').addEventListener('click', async (event) => {
        event.preventDefault();

        const dialog = document.querySelector('#goalDialog');
        const confirmBtn = document.querySelector('#confirmGoal');
        const cancelBtn = document.querySelector('#cancelGoal');
        const input = document.querySelector('#goalInput');

        dialog.showModal();
        confirmBtn.addEventListener('click', async () => {
            if (!input.value) return alert('Please enter a valid goal.');
            const newGoal = Number(input.value);
            if (!newGoal) return;
            await sendGoal(newGoal);
            input.value = '';
            dialog.close();
            const lable = document.querySelector('#goal-lable');
            lable.innerHTML = `Goal is now: '${goal}'`;
        });
        cancelBtn.addEventListener('click', () => {
            input.value = '';
            dialog.close();
        });
    });
}
async function sendGoal(newGoal) {
    let request;
    request = await fetch('/goal/update', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: Number(newGoal) })
    });

    const result = await request.json();
    if (!result.success) return;
    goal = Number(result.data);
    const allRows = document.querySelectorAll('#weight-loss-list tr');
    const howmanyToGo = needToLoss(allRows);
    const percent = goalPercent(allRows);
    const summaryCells = document.querySelectorAll('#summarys-list tr td');

    summaryCells[3].textContent = howmanyToGo;
    summaryCells[4].textContent = percent + '%';
    summaryCells[5].textContent = goal + ' lb';
}
function submitForm() {
    document.querySelector('#submit').addEventListener('click', async (event) => {
        event.preventDefault();
        if (goal === '-') return alert('Please set a goal to continue using the app.');
        const date = document.querySelector('#date').value;
        const weight = document.querySelector('#weight').value;
        if (!date || !weight) return alert('Please Fill Out All Fields!');
        await sendData();
    });
};
async function sendData() {
    const date = document.querySelector('#date').value;
    const weight = document.querySelector('#weight').value;
    const comment = document.querySelector('#comment').value;

    let previousWeight = null;
    const existingRows = document.querySelectorAll('#weight-loss-list tr');
    if (existingRows.length > 0) {
        previousWeight = Number(existingRows[existingRows.length - 1].cells[1].textContent.trim());
    }

    const request = await fetch('/table/send', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, weight, comment })
    });
    const result = await request.json();
    if (!result.success) return console.error('Failed to fetch data:', result.error);
    table.innerHTML = '';
    result.data.forEach(row => {
        trToTable(row, table);
    });
    allRows = document.querySelectorAll('#weight-loss-list tr');
    calculations(allRows);
    table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    //celebration
    const newWeight = Number(weight);
    if (previousWeight !== null && newWeight < previousWeight) {
        const lost = previousWeight - newWeight;
        showCelebration(lost);
    }

    document.querySelector('#weight').value = '';
    document.querySelector('#date').value = '';
    document.querySelector('#comment').value = '';
}

//table
async function getTable(allRows) {
    const request = await fetch('/table/get-all', { method: 'get' });
    const result = await request.json();
    if (!result.success) return console.error('Failed to fetch data:', result.error);
    table.innerHTML = '';
    result.data.forEach(row => {
        trToTable(row, table);
    });
    await getGoal();
    allRows = document.querySelectorAll('#weight-loss-list tr');
    calculations(allRows);
    const lastname = sessionStorage.getItem('lastName');
    const firstname = sessionStorage.getItem('firstName');

    document.querySelector('.username-apper').textContent = ` ${firstname} ${lastname}`;
}
async function getGoal() {
    const request = await fetch('/goal/get', { method: 'get' });
    const result = await request.json();

    if (!result.success) {
        return result.error;
    } else if (result.goal === null) {
        return alert('Please set a goal to continue using the app.');
    }
    goal = result.goal;
    const lable = document.querySelector('#goal-lable');
    lable.innerHTML = `Goal is now: '${goal}'`;
}
function trToTable(row, table) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
                    <td>${new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</td>
                    <td>${row.weight}</td>
                    <td></td>
                    <td>${row.comment}</td>
                    <td><button id="${row.id}" class="deleteBtn">Delete</button></td>
                    `;
    table.appendChild(newRow);
}

//search
function search() {
    const refreshTable = document.querySelector('.get-all-btn');
    const summaryArea = document.querySelector('.summary-area');
    async function getBackAll() {
        await getTable();
        refreshTable.style.display = 'none';
        summaryArea.style.display = 'block';
    };

    document.querySelectorAll('#search-date-btn, #search-weight-btn').forEach(searchBtn => {
        searchBtn.addEventListener('click', async function (event) {
            event.preventDefault();
            const inputDate = document.querySelector('#search-date').value;
            const inputWeight = document.querySelector('#search-weight').value;
            if (!inputDate && !inputWeight) return;

            const request = await fetch('/table/search', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: inputDate, weight: inputWeight })
            });
            const result = await request.json();
            if (!result.success) return console.error('failed to fetch data');
            if (result.data.length > 0) {
                table.innerHTML = '';
                for (let row of result.data) {
                    trToTable(row, table);
                }
                refreshTable.style.display = 'block';
                refreshTable.removeEventListener('click', getBackAll);
                refreshTable.addEventListener('click', getBackAll);
                const myContainer = document.querySelector('.submit-button');
                myContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                summaryArea.style.display = 'none';
            } else {
                alert('No matching data found for the given search criteria.');
            }

            document.querySelector('#search-date').value = '';
            document.querySelector('#search-weight').value = '';
        });
    });
}

//delete
function deleteData() {
    table.addEventListener('click', async function (event) {
        if (!event.target.classList.contains('deleteBtn')) return;
        event.preventDefault();

        const confirmed = await showConfirmDialog();
        if (!confirmed) return;

        const newId = event.target.getAttribute('id');
        const request = await fetch('/table/delete', {
            method: 'delete',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: newId })
        });

        const result = await request.json();
        if (result.success) {
            event.target.closest('tr').remove();
            allRows = document.querySelectorAll('#weight-loss-list tr');
            calculations(allRows);
        } else {
            console.error('Delete failed', result.error);
        }
    });
}
function showConfirmDialog() {
    return new Promise((resolve) => {
        const dialog = document.querySelector('#deleteDialog');
        const yesBtn = document.querySelector('#confirmYes');
        const noBtn = document.querySelector('#confirmNo');

        dialog.showModal();

        const freshYes = yesBtn.cloneNode(true);
        const freshNo = noBtn.cloneNode(true);
        yesBtn.replaceWith(freshYes);
        noBtn.replaceWith(freshNo);

        freshYes.addEventListener('click', function () {
            dialog.close();
            resolve(true);
        });
        freshNo.addEventListener('click', function () {
            dialog.close();
            resolve(false);
        });
    });
}

//statistics
function calculations(allRows) {
    calculateSinceLastWeight(allRows);
    const rowCount = weeks(allRows);
    const avrage = avrageLost(allRows);
    const totalWeightLost = calculateTotalWeightLost(allRows);
    const toLoss = needToLoss(allRows);
    const percent = goalPercent(allRows);

    trTosummary(rowCount, avrage, totalWeightLost, toLoss, percent);
}
function calculateSinceLastWeight(allRows) {
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
function weeks(allRows) {
    const rowCount = allRows.length;
    if (allRows.length === 0) return '-';
    return (rowCount);
}
function avrageLost(allRows) {
    if (allRows.length < 2) return '-';

    let allWeights = 0;
    allRows.forEach(row => {
        allWeights += Number(row.cells[2].textContent);
    })
    const avrage = (allWeights / (allRows.length - 1)).toFixed(1);
    return (avrage);
}
function calculateTotalWeightLost(allRows) {
    if (allRows.length === 0) return '-';
    const startingWeight = Number(allRows[0].cells[1].textContent);
    const lastWeight = Number(allRows[allRows.length - 1].cells[1].textContent);
    const totalWeightLost = startingWeight - lastWeight;
    if (totalWeightLost < 0.1) return '-';
    return (totalWeightLost.toFixed(1))
}
function needToLoss(allRows) {
    if (allRows.length === 0) return '-';
    const lastRow = allRows[allRows.length - 1];
    const lastWeight = Number(lastRow.cells[1].textContent);
    const lastVsGoal = lastWeight - goal;
    const howmanyToGo = lastVsGoal.toFixed(1);
    if ((lastWeight === goal) || (lastWeight < goal)) return '-';
    return (howmanyToGo)
}
function goalPercent(allRows) {
    if (allRows.length === 0) return '';

    const startWeight = Number(allRows[0].cells[1].textContent);
    const currentWeight = Number(allRows[allRows.length - 1].cells[1].textContent);
    const totalToLose = startWeight - goal;
    const alreadyLost = startWeight - currentWeight;
    const percent = ((alreadyLost / totalToLose) * 100).toFixed();

    if ((startWeight < goal) && (currentWeight < goal)) return 100;
    if ((startWeight < goal) && (currentWeight > goal)) return '';
    return (percent);
}
function trTosummary(rowCount, avrage, totalWeightLost, toLoss, goalPercent) {
    const tbody = document.querySelector('#summarys-list')
    tbody.innerHTML = '';
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
    <td>${rowCount}</td>
    <td>${avrage}</td>
    <td>${totalWeightLost}</td>
    <td>${toLoss}</td>
    <td>${goalPercent}%</td>
    <td>${goal} lb</td>
    `;
    tbody.appendChild(newRow);
}

// CELEBRATION / FIREWORKS FUNCTIONS (created with AI);
function showStopBtn() {
    document.getElementById('stop-song-btn-on-page').style.display = 'block';
    document.getElementById('stop-song-btn').style.display = 'block';
}
function hideStopBtn() {
    document.getElementById('stop-song-btn-on-page').style.display = 'none';
    document.getElementById('stop-song-btn').style.display = 'none';
}
let _fwInterval = null;
let _fwFrame = null;
const _fwParticles = [];
function showCelebration(lostAmount) {
    const overlay = document.getElementById('celebration-overlay');
    const text = document.getElementById('celebration-text');
    text.innerHTML = `You lost <strong style="color:#FFD700; font-size:1.8rem;">${lostAmount.toFixed(1)} lbs</strong> since last week!<br>Amazing work! 🔥`;
    overlay.classList.add('active');
    showStopBtn();
    const audio = document.getElementById('celebration-audio');
    audio.play();
    audio.onended = () => {
        hideStopBtn();
    };
    const canvas = document.getElementById('fireworks-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    _launchFireworks(canvas);
    setTimeout(closeCelebration, 10000);
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
function stopSong() {
    const audio = document.getElementById('celebration-audio');
    audio.pause();
    audio.currentTime = 0;
    hideStopBtn();
}