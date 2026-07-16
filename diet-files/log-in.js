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
    if (result.success) {
        console.log('good pass');
        window.open(result.window, result.target);
    } else {
        alert('Wrong password, try again!');
        document.querySelector('#inputPass').value = '';
    }
}


 function tripLogIn(){
    const userEntered = document.querySelector('#tripInputPass').value;
    
    if (userEntered === '123') {
        console.log('good pass');
        window.open('trip.html', '_self');
    } else {
        alert('Wrong password, try again!');
        document.querySelector('#tripInputPass').value = '';
    }
}
