document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#logInBtn').addEventListener('click', async function (event) {
        event.preventDefault();
        await logIn();
    });
    document.querySelector('#signIn').addEventListener('click', async function (event) {
        event.preventDefault();
        const dialog = document.querySelector('.signDialog');
        dialog.showModal();
    });
    document.querySelector('#signInBtn').addEventListener('click', async function (event) {
        event.preventDefault();
        await signIn();
    });
    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.querySelector('.signDialog').close();
    });
})

async function logIn() {
    const userEnteredName = document.querySelector('#inputName').value;
    const userEntered = document.querySelector('#inputPass').value;
    const request = await fetch('/auth/log-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userEnteredName, password: userEntered })
    });
    const result = await request.json();
    if (!result.success) return alert('Not An Existing User, try again!');
    sessionStorage.setItem('firstName', result.data.first_name);
    sessionStorage.setItem('lastName', result.data.last_name);

    window.open(result.window, result.target);
    document.querySelector('#inputPass').value = '';
    document.querySelector('#inputName').value = '';
}

async function signIn() {
    const firstName = document.querySelector('#inputSignFName').value;
    const middleName = document.querySelector('#inputSignMName').value;
    const lastName = document.querySelector('#inputSignLName').value;
    const userName = document.querySelector('#inputUsername').value;
    const userPass = document.querySelector('#inputSignPass').value;

    const request = await fetch('/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            first: firstName,
            middle: middleName,
            last: lastName,
            name: userName,
            password: userPass
        })
    });
    const result = await request.json();
    if (!result.success) return alert('Something went wrong, try again!');
    document.querySelector('#inputSignFName').value = '';
    document.querySelector('#inputSignMName').value = '';
    document.querySelector('#inputSignLName').value = '';
    document.querySelector('#inputUsername').value = '';
    document.querySelector('#inputSignPass').value = '';
    document.querySelector('.signDialog').close();
}