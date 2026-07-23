document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#logInBtn').addEventListener('click', async function (event) {
        event.preventDefault();
        await logIn();
    });
})
async function logIn(){
    const userEntered = document.querySelector('#inputPass').value;
    const request = await fetch('/log-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: userEntered })
    });
    const result = await request.json();
    if (!result.success)return  alert('Wrong password, try again!');
        window.open(result.window, result.target);
        document.querySelector('#inputPass').value = '';
}