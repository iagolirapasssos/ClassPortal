document.addEventListener('DOMContentLoaded', () => {
    const createRoomBtn = document.getElementById('createRoomBtn');
    const enterRoomBtn = document.getElementById('enterRoomBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const postBtn = document.getElementById('postBtn');
    const masterRoomContainer = document.getElementById('masterRoomContainer');
    
    const createRoomContainer = document.getElementById('createRoom');
    const enterRoomContainer = document.getElementById('enterRoom');
    const roomContainer = document.getElementById('roomContainer');
    
    const roomNameInput = document.getElementById('roomName');
    const roomCodeInput = document.getElementById('roomCode');
    const studentNameInput = document.getElementById('studentName');
    const roomTitle = document.getElementById('roomTitle');
    const roomCodeDisplay = document.getElementById('roomCodeDisplay');
    
    const postText = document.getElementById('postText');
    const postImage = document.getElementById('postImage');
    const postsContainer = document.getElementById('posts');

    let currentRoomCode = '';
    let currentRoom = null;
    let currentUser = null;
    const userIp = localStorage.getItem('userIp') || `IP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    localStorage.setItem('userIp', userIp);

    function generateRoomCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    function saveRoom(room) {
        try {
            localStorage.setItem(room.code, JSON.stringify(room));
            // Salvar o código da sala em uma lista global
            let rooms = JSON.parse(localStorage.getItem('rooms')) || [];
            if (!rooms.includes(room.code)) {
                rooms.push(room.code);
                localStorage.setItem('rooms', JSON.stringify(rooms));
            }
        } catch (e) {
            console.error('Erro ao salvar a sala:', e);
        }
    }

    function loadRoom(code) {
        try {
            const room = localStorage.getItem(code);
            return room ? JSON.parse(room) : null;
        } catch (e) {
            console.error('Erro ao carregar a sala:', e);
            return null;
        }
    }

    function loadRooms() {
        try {
            const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
            return rooms.map(code => loadRoom(code));
        } catch (e) {
            console.error('Erro ao carregar as salas:', e);
            return [];
        }
    }

    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        const postContent = document.createElement('p');
        postContent.textContent = post.text;
        postElement.appendChild(postContent);

        if (post.image) {
            const postImageElement = document.createElement('img');
            postImageElement.src = post.image;
            postElement.appendChild(postImageElement);
        }

        const postMeta = document.createElement('div');
        postMeta.className = 'post-meta';
        postMeta.innerHTML = `
            <span>${new Date(post.date).toLocaleString('pt-BR')}</span>
            <span>Postado por: ${post.authorName || 'Desconhecido'}</span>
            <span>IP: ${post.authorIp || 'Desconhecido'}</span>
        `;
        postElement.appendChild(postMeta);

        if (currentRoom.creator === userIp) {
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => {
                currentRoom.posts = currentRoom.posts.filter(p => p !== post);
                saveRoom(currentRoom);
                loadPosts();
            });
            postElement.appendChild(deleteBtn);
        }

        return postElement;
    }

    function loadPosts() {
        postsContainer.innerHTML = ''; // Limpar posts existentes
        if (currentRoom && currentRoom.posts) {
            currentRoom.posts
                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Ordenar por data
                .forEach(post => {
                    postsContainer.appendChild(createPostElement(post));
                });
        }
    }

    function loadMasterPage() {
        masterRoomContainer.innerHTML = '';
        loadRooms().forEach(room => {
            if (room) {
                const roomCard = document.createElement('div');
                roomCard.className = 'room-card';

                const roomTitleElement = document.createElement('h3');
                roomTitleElement.textContent = `Sala: ${room.name}`;
                roomCard.appendChild(roomTitleElement);

                const viewBtn = document.createElement('button');
                viewBtn.textContent = 'Ver Conteúdos';
                viewBtn.className = 'edit-btn';
                viewBtn.addEventListener('click', () => {
                    localStorage.setItem('currentRoom', room.code);
                    window.location.href = 'room.html';
                });
                roomCard.appendChild(viewBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Excluir Sala';
                deleteBtn.className = 'delete-btn';
                deleteBtn.addEventListener('click', () => {
                    localStorage.removeItem(room.code);
                    let rooms = JSON.parse(localStorage.getItem('rooms')) || [];
                    rooms = rooms.filter(code => code !== room.code);
                    localStorage.setItem('rooms', JSON.stringify(rooms));
                    loadMasterPage();
                });
                roomCard.appendChild(deleteBtn);

                masterRoomContainer.appendChild(roomCard);
            }
        });
    }

    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            const roomName = roomNameInput.value.trim();
            if (roomName) {
                const roomCode = generateRoomCode();
                const room = {
                    name: roomName,
                    code: roomCode,
                    creator: userIp,
                    posts: []
                };
                saveRoom(room);
                localStorage.setItem('currentRoom', roomCode); // Salvar a sala como atual para redirecionar o mestre
                window.location.href = 'master.html'; // Redirecionar para a página de controle
                roomNameInput.value = '';
            } else {
                alert('Por favor, insira um nome para a sala.');
            }
        });
    }

    if (enterRoomBtn) {
        enterRoomBtn.addEventListener('click', () => {
            const roomCode = roomCodeInput.value.trim();
            const studentName = studentNameInput.value.trim();
            if (roomCode && studentName) {
                const room = loadRoom(roomCode);
                if (room) {
                    currentRoom = room;
                    currentUser = studentName;
                    roomCodeDisplay.textContent = `Código da Sala: ${roomCode}`;
                    roomTitle.textContent = `Sala: ${room.name}`;
                    createRoomContainer.classList.add('hidden');
                    enterRoomContainer.classList.add('hidden');
                    roomContainer.classList.remove('hidden');
                    loadPosts();
                } else {
                    alert('Código da sala inválido.');
                }
            } else {
                alert('Por favor, insira o código da sala e seu nome.');
            }
        });
    }

    if (postBtn) {
        postBtn.addEventListener('click', () => {
            const text = postText.value.trim();
            const image = postImage.files[0];

            if (text || image) {
                const post = {
                    text,
                    image: null,
                    date: new Date().toISOString(),
                    authorName: currentUser,
                    authorIp: userIp
                };

                if (image) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        post.image = reader.result;
                        currentRoom.posts.push(post);
                        saveRoom(currentRoom);
                        loadPosts();
                        postText.value = '';
                        postImage.value = '';
                    };
                    reader.readAsDataURL(image);
                } else {
                    currentRoom.posts.push(post);
                    saveRoom(currentRoom);
                    loadPosts();
                    postText.value = '';
                }
            } else {
                alert('Você deve adicionar algum texto ou imagem.');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentRoom');
            window.location.href = 'index.html';
        });
    }

    // Redirecionar automaticamente para a página de controle se o usuário for o mestre
    if (window.location.pathname.endsWith('index.html')) {
        const roomCode = localStorage.getItem('currentRoom');
        if (roomCode) {
            window.location.href = 'master.html';
        }
    }

    if (window.location.pathname.endsWith('master.html')) {
        loadMasterPage();
    }
    
    if (window.location.pathname.endsWith('room.html')) {
        const roomCode = localStorage.getItem('currentRoom');
        if (roomCode) {
            const room = loadRoom(roomCode);
            if (room) {
                currentRoom = room;
                roomTitle.textContent = `Sala: ${room.name}`;
                roomCodeDisplay.textContent = `Código da Sala: ${roomCode}`;
                loadPosts();
            } else {
                alert('Erro ao carregar a sala.');
                window.location.href = 'index.html';
            }
        } else {
            alert('Código da sala não encontrado.');
            window.location.href = 'index.html';
        }
    }
});

