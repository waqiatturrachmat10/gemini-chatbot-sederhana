document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const resetBtn = document.getElementById('reset-btn');

    // --- FUNGSI 1: Kirim Pesan ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // 1. Tampilkan Pesan User
        appendMessage('User', message, 'user-message');
        userInput.value = '';

        // 2. Tampilkan Animasi "Thinking..."
        const botMessageElement = document.createElement('div');
        botMessageElement.classList.add('message', 'bot-message');
        botMessageElement.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        chatBox.appendChild(botMessageElement);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            // 3. Kirim ke Backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation: [{ role: "user", content: message }]
                })
            });

            if (!response.ok) throw new Error('Network error');
            const data = await response.json();

            // 4. Ganti animasi dengan jawaban Gemini
            if (data.result) {
                // Gunakan innerHTML agar format bold/list dari AI terbaca (opsional)
                botMessageElement.innerHTML = `<strong>Bot:</strong> <span class="text-content">${formatText(data.result)}</span>`;
            } else {
                botMessageElement.innerHTML = `<span style="color:red">Maaf, tidak ada balasan.</span>`;
            }

        } catch (error) {
            console.error(error);
            botMessageElement.innerHTML = `<span style="color:red">Error: Gagal terhubung ke server.</span>`;
        }
    });

    // --- FUNGSI 2: Tombol Reset ---
    resetBtn.addEventListener('click', () => {
        chatBox.innerHTML = ''; // Hapus semua
        
        // Munculkan pesan awal lagi
        const defaultMsg = document.createElement('div');
        defaultMsg.classList.add('message', 'bot-message');
        defaultMsg.innerHTML = '<strong>Bot:</strong> <span class="text-content">Chat telah dibersihkan. Ada topik baru?</span>';
        chatBox.appendChild(defaultMsg);
    });

    // Helper: Tambah pesan ke layar
    function appendMessage(sender, text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', className);
        if (sender === 'User') {
            messageDiv.innerHTML = `<span class="text-content">${text}</span>`;
        } else {
            messageDiv.innerHTML = `<strong>${sender}:</strong> <span class="text-content">${text}</span>`;
        }
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Helper: Sedikit formatting text (Ganti newline jadi <br>)
    function formatText(text) {
        return text.replace(/\n/g, '<br>');
    }
});