document.addEventListener('DOMContentLoaded', () => {
    const createRoomContainer = document.getElementById('createRoom');
    const enterRoomContainer = document.getElementById('enterRoom');
    const masterRoomContainer = document.getElementById('masterRoomContainer');
    const roomContainer = document.getElementById('roomContainer');

    const createRoomBtn = document.getElementById('createRoomBtn');
    const roomNameInput = document.getElementById('roomNameInput');
    const enterRoomBtn = document.getElementById('enterRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');
    const studentNameInput = document.getElementById('studentNameInput');
    const postBtn = document.getElementById('postBtn');
    const postText = document.getElementById('postText');
    const postImage = document.getElementById('postImage');
    const logoutBtn = document.getElementById('logoutBtn');
    const postsDiv = document.getElementById('posts');
    const roomsList = document.getElementById('roomsList');

    const createNewRoomBtn = document.getElementById('createNewRoomBtn');
    const createRoomModal = document.getElementById('createRoomModal');
    const newRoomNameInput = document.getElementById('newRoomNameInput');
    const confirmCreateRoomBtn = document.getElementById('confirmCreateRoomBtn');
    const cancelCreateRoomBtn = document.getElementById('cancelCreateRoomBtn');

    let userIp = '';
    let currentRoomCode = '';

    function getClientIP() {
        return fetch('/get-client-ip')
            .then(response => response.json())
            .then(data => data.ip);
    }

    function loadPosts() {
        if (currentRoomCode) {
            fetch(`/rooms/${currentRoomCode}/posts`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(room => {
                    postsDiv.innerHTML = ''; 
                    if (room && room.posts) {
                        room.posts.forEach(post => {
                            const postDiv = document.createElement('div');
                            postDiv.className = 'post';
                            postDiv.innerHTML = `
                                <p>${post.text}</p>
                                ${post.image ? `<img src="${post.image}" alt="Post Image" style="max-width: 100%;">` : ''}
                                <div class="post-meta">
                                    <span>${new Date(post.date).toLocaleString()}</span>
                                    <span> - ${post.authorName} (${post.authorIp})</span>
                                    ${post.authorIp === userIp ? `<button class="delete-post-btn" data-id="${post.id}">Excluir</button>` : ''}
                                </div>
                            `;
                            postsDiv.appendChild(postDiv);
                        });

                        document.querySelectorAll('.delete-post-btn').forEach(button => {
                            button.addEventListener('click', () => {
                                const postId = button.getAttribute('data-id');

                                fetch(`/rooms/${currentRoomCode}/posts/${postId}`, {
                                    method: 'DELETE',
                                })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error(`Erro ${response.status}: ${response.statusText}`);
                                    }
                                    return response.text();
                                })
                                .then(message => {
                                    console.log('Sucesso:', message);
                                    // Atualiza a UI após a exclusão
                                    loadPosts();
                                })
                                .catch(error => {
                                    console.error('Erro ao excluir postagem:', error);
                                });                                
                            });
                        });
                    } else {
                        postsDiv.innerHTML = '<p>Nenhum post disponível.</p>';
                    }
                })
                .catch(error => console.error('Erro ao carregar posts:', error));
        }
    }


    function loadRoom(roomCode) {
        currentRoomCode = roomCode;
        console.log(`Tentando carregar a sala com o código: ${roomCode}`);

        fetch(`/rooms/${roomCode}.json`)
            .then(response => {
                console.log("Resposta da requisição de sala:", response);
                if (response.ok) {
                    return response.json();
                } else if (response.status === 404) {
                    console.error(`Sala não encontrada: ${roomCode}`);
                    window.location.href = 'index.html'; // Redireciona apenas se a sala não for encontrada
                    throw new Error('Sala não encontrada');
                } else {
                    return response.text().then(text => {
                        console.error('Erro ao carregar sala:', text);
                        throw new Error('Erro ao carregar sala');
                    });
                }
            })
            .then(room => {
                if (room) {
                    console.log('Sala carregada com sucesso:', room);
                    document.getElementById('roomTitle').textContent = room.name;
                    loadPosts(); // Carrega os posts após carregar a sala
                }
            })
            .catch(error => {
                console.error('Erro ao carregar sala:', error);
            });
    }

    function checkExistingRoom() {
        fetch('/get-room-list')
            .then(response => response.json())
            .then(rooms => {
                getClientIP().then(ip => {
                    const userIp = ip;
                    if (userIp) {
                        const room = rooms.find(r => r.creator.ip === userIp); // Certifique-se de que o campo está correto
                        if (room) {
                            window.location.href = 'master.html';
                        }
                    }
                })
                .catch(error => console.error('Erro ao obter IP do cliente:', error)); // Adiciona tratamento de erro para getClientIP
            })
            .catch(error => console.error('Erro ao verificar salas existentes:', error));
    }

    function loadMasterPage() {
        fetch('/get-room-list')
            .then(response => response.json())
            .then(rooms => {
                roomsList.innerHTML = ''; 
                rooms.forEach(room => {
                    const roomCard = document.createElement('div');
                    roomCard.className = 'room-card';
                    roomCard.innerHTML = `
                        <h3>${room.name}</h3>
                        <p>Código: ${room.code}</p>
                        <button class="open-room-btn" data-code="${room.code}">Abrir Sala</button>
                        ${room.creator.ip === userIp ? `<button class="delete-btn" data-code="${room.code}">Excluir</button>` : ''}
                    `;
                    roomsList.appendChild(roomCard);
                });

                document.querySelectorAll('.open-room-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const roomCode = button.getAttribute('data-code');
                        window.location.href = `room.html?code=${roomCode}`;
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const roomCode = button.getAttribute('data-code');
                        fetch(`/delete-room/${roomCode}`, { method: 'DELETE' })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    loadMasterPage(); 
                                } else {
                                    console.error('Erro ao excluir sala:', data.error);
                                }
                            })
                            .catch(error => console.error('Erro ao excluir sala:', error));
                    });
                });
            })
            .catch(error => console.error('Erro ao carregar salas:', error));
    }

    if (document.body.contains(createRoomContainer)) {
        getClientIP().then(ip => {
            userIp = ip;

            createRoomBtn.addEventListener('click', () => {
                const roomName = roomNameInput.value;
                const authorName = 'Professor'; // Substitua por lógica de entrada real
                if (roomName) {
                    fetch('/create-room', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ roomName, authorName, userIp})
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.location.href = 'master.html';
                        } else {
                            console.error('Erro ao criar sala:', data.error);
                        }
                    })
                    .catch(error => console.error('Erro ao criar sala:', error));
                }
            });

            enterRoomBtn.addEventListener('click', () => {
                const roomCode = roomCodeInput.value;
                const studentName = studentNameInput.value;
                
                if (roomCode && studentName) {
                    fetch(`/checkRoom/${roomCode}?username=${studentName}`)
                        .then(response => {
                            if (response.redirected) {
                                window.location.href = `room.html?code=${roomCode}`;
                            } else {
                                alert('Erro ao entrar na sala.');
                            }
                        })
                        .catch(error => console.error('Erro ao entrar na sala:', error));
                }
            });


            checkExistingRoom();
        })
        .catch(error => console.error('Erro ao obter IP do usuário:', error));
    }

    //master.html buttons
    if (createNewRoomBtn) {
        createNewRoomBtn.addEventListener('click', () => {
            createRoomModal.style.display = 'block';
        });
    }

    if (cancelCreateRoomBtn) {
        cancelCreateRoomBtn.addEventListener('click', () => {
            createRoomModal.style.display = 'none';
            newRoomNameInput.value = '';
        });
    }

    if (confirmCreateRoomBtn) {
        confirmCreateRoomBtn.addEventListener('click', () => {
            const newRoomName = newRoomNameInput.value.trim();
            if (newRoomName) {
                getClientIP().then(ip => {
                    fetch('/create-room', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ roomName: newRoomName, authorName: 'Professor', userIp: ip })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            createRoomModal.style.display = 'none';
                            newRoomNameInput.value = '';
                            loadMasterPage(); // Recarrega a lista de salas
                        } else {
                            console.error('Erro ao criar sala:', data.error);
                        }
                    })
                    .catch(error => console.error('Erro ao criar sala:', error));
                });
            }
        });
    }

    // Fechar o modal se clicar fora dele
    window.onclick = function(event) {
        if (event.target == createRoomModal) {
            createRoomModal.style.display = 'none';
            newRoomNameInput.value = '';
        }
    }
    //

    if (document.body.contains(roomContainer)) {
        getClientIP().then(ip => {
            userIp = ip;
            const urlParams = new URLSearchParams(window.location.search);
            const storedRoomCode = urlParams.get('code');
            if (storedRoomCode) {
                loadRoom(storedRoomCode);
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch(error => console.error('Erro ao obter IP do usuário:', error));
    }

    if (document.body.contains(masterRoomContainer)) {
        getClientIP().then(ip => {
            userIp = ip;
            loadMasterPage();
        })
        .catch(error => console.error('Erro ao obter IP do usuário:', error));
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            fetch('/logout', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = 'index.html';
                    } else {
                        console.error('Erro ao fazer logout:', data.error);
                    }
                })
                .catch(error => console.error('Erro ao fazer logout:', error));
        });
    }

    if (postBtn) {
        postBtn.addEventListener('click', () => {
            const text = postText.value;
            const image = postImage.files[0];

            if (!text && !image) {
                alert('Texto ou imagem são necessários!');
                return;
            }

            const formData = new FormData();
            formData.append('text', text);
            if (image) {
                formData.append('image', image);
            }

            formData.append('timestamp', Date.now());

            fetch(`/rooms/${currentRoomCode}/posts`, {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    postText.value = ''; // Limpa o campo de texto
                    postImage.value = ''; // Limpa o campo de imagem
                    loadPosts();
                } else {
                    console.error('Erro ao postar conteúdo:', data.error);
                }
            })
            .catch(error => console.error('Erro ao postar conteúdo:', error));
        });
    }


});
