document.addEventListener('DOMContentLoaded', () => {
    const chatBtn = document.querySelector('#chat-button');
    const dialog = document.querySelector('#chatDialog');
    const closeBtn = document.querySelector('#closeChat');
    const form = document.querySelector('#chat-form');
    const input = document.querySelector('#new-message');
    const sendBtn = document.querySelector('#send');

    let messages = [];
    let chatGeneration = 0;

    function endConversation() {
        chatGeneration += 1;
        messages = [];
        input.value = '';
        renderMessages([]);

        fetch('/chat/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
            keepalive: true,
        }).catch(() => {});
    }

    function openChat() {
        messages = [];
        renderMessages([]);
        dialog.showModal();
        chatBtn.classList.add('is-hidden');
        input.focus();
    }

    function closeChat() {
        dialog.close();
    }

    chatBtn.addEventListener('click', (event) => {
        event.preventDefault();
        openChat();
    });

    closeBtn?.addEventListener('click', closeChat);

    dialog.addEventListener('close', () => {
        endConversation();
        chatBtn.classList.remove('is-hidden');
        chatBtn.focus();
    });

    window.addEventListener('pagehide', endConversation);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newMessage = input.value.trim();
        if (!newMessage) {
            return alert('no message written!');
        }

        const generation = chatGeneration;
        input.value = '';
        sendBtn.disabled = true;
        messages.push({ role: 'user', message: newMessage });
        appendMessage(newMessage, 'user');
        showPending();

        try {
            const request = await fetch('/chat/new-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newMessage,
                    history: messages.slice(-20),
                }),
            });
            const result = await request.json();

            if (generation !== chatGeneration) return;

            document.querySelector('#chatMessages .pending')?.remove();
            if (result.reply) {
                messages.push({ role: 'assistant', message: result.reply });
                appendMessage(result.reply, 'assistant');
            }
            if (!result.success) {
                return alert(result.message || 'Error sending message');
            }
        } catch (error) {
            if (generation === chatGeneration) {
                document.querySelector('#chatMessages .pending')?.remove();
                alert('Error sending message');
            }
        } finally {
            sendBtn.disabled = false;
            if (generation === chatGeneration) input.focus();
        }
    });
});

function renderMessages(rows) {
    const chat = document.querySelector('#chatMessages');
    if (!chat) return;

    chat.innerHTML = '';

    if (!rows?.length) {
        const empty = document.createElement('p');
        empty.className = 'chat-dialog__empty';
        empty.textContent = 'Ask about your weight entries, weekly change, or goal.';
        chat.appendChild(empty);
        return;
    }

    rows.forEach((row) => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${row.role === 'assistant' ? 'assistant' : 'user'}`;
        bubble.textContent = row.message;
        chat.appendChild(bubble);
    });

    chat.scrollTop = chat.scrollHeight;
}

function appendMessage(text, role) {
    const chat = document.querySelector('#chatMessages');
    if (!chat) return;

    chat.querySelector('.chat-dialog__empty')?.remove();

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role === 'assistant' ? 'assistant' : 'user'}`;
    bubble.textContent = text;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
}

function showPending() {
    const chat = document.querySelector('#chatMessages');
    if (!chat) return;

    chat.querySelector('.chat-dialog__empty')?.remove();

    const pending = document.createElement('div');
    pending.className = 'chat-bubble assistant pending';
    pending.textContent = 'Thinking…';
    chat.appendChild(pending);
    chat.scrollTop = chat.scrollHeight;
}

