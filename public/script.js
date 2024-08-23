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

    //Fabric and modals
    // Definindo variáveis de elementos do DOM
    let canvas;
    let isErasing = false;
    let brushSize = 5;
    let eraserSize = 20;

    const drawBtn = document.getElementById('drawBtn');
    const drawModal = document.getElementById('drawModal');
    const closeDrawModal = document.getElementById('closeDrawModal');
    const saveDrawingBtn = document.getElementById('saveDrawingBtn');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const colorPicker = document.getElementById('colorPicker');
    const fillBtn = document.getElementById('fillBtn');
    const eraseBtn = document.getElementById('eraseBtn');
    const increaseBrushSize = document.getElementById('increaseBrushSize');
    const decreaseBrushSize = document.getElementById('decreaseBrushSize');
    const increaseEraserSize = document.getElementById('increaseEraserSize');
    const decreaseEraserSize = document.getElementById('decreaseEraserSize');
    const canvasImageInput = document.getElementById('canvasImageInput');
    const postImageInput = document.getElementById('postImage');

    // Importa Fabric.js dinamicamente
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/6.3.0/fabric.min.js";
    document.head.appendChild(script);

    let userIp = '';
    let currentRoomCode = '';

    function getClientIP() {
        return fetch('/get-client-ip')
            .then(response => response.json())
            .then(data => data.ip);
    }

    // FABRIC.js em room.html


    // Inicializa o canvas para desenho
    function setupCanvas() {
        canvas = new fabric.Canvas('drawCanvas');
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = colorPicker.value;
        canvas.freeDrawingBrush.width = brushSize; // Espessura inicial do pincel
    }

    // Atualiza a cor do pincel
    function setBrushColor(color) {
        if (canvas) {
            canvas.freeDrawingBrush.color = color;
        }
    }

    // Alterna entre o modo de desenho e a borracha
    function toggleEraser() {
        isErasing = !isErasing;
        canvas.freeDrawingBrush.color = isErasing ? '#ffffff' : colorPicker.value;
        canvas.freeDrawingBrush.width = isErasing ? eraserSize : brushSize;
    }

    // Preenche áreas fechadas
    function fillClosedAreas() {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const color = colorPicker.value;

        // Iterar sobre os objetos de caminho
        canvas.getObjects('path').forEach(obj => {
            const path = obj.path;
            if (path && path.length > 0) {
                ctx.beginPath();
                path.forEach(command => {
                    const [type, ...params] = command;
                    switch (type) {
                        case 'M':
                            ctx.moveTo(...params);
                            break;
                        case 'L':
                            ctx.lineTo(...params);
                            break;
                        case 'C':
                            ctx.bezierCurveTo(...params);
                            break;
                        case 'Q':
                            ctx.quadraticCurveTo(...params);
                            break;
                        case 'Z':
                            ctx.closePath();
                            break;
                    }
                });
                ctx.fillStyle = color;
                ctx.fill();
            }
        });

        canvas.renderAll();
    }

    // Limpa o canvas
    function clearCanvas() {
        if (canvas) {
            canvas.clear();
        }
    }

    // Carrega uma imagem no canvas
    function loadImageIntoCanvas(file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const imgObj = new Image();
            imgObj.src = event.target.result;
            imgObj.onload = function () {
                const img = new fabric.Image(imgObj);
                img.scaleToWidth(canvas.width);
                img.scaleToHeight(canvas.height);
                canvas.add(img);
                canvas.renderAll();
            };
        };
        reader.readAsDataURL(file);
    }

    // Abre o modal de desenho
    if (drawBtn) {
        drawBtn.addEventListener('click', () => {
            drawModal.style.display = 'flex'; // Mostrar modal
            if (!canvas) {
                setupCanvas();
            }
        });
    }

    // Fecha o modal de desenho
    if (closeDrawModal) {
        closeDrawModal.addEventListener('click', () => {
            drawModal.style.display = 'none';
        });
    }

    if (colorPicker) {
        colorPicker.addEventListener('change', () => {
            setBrushColor(colorPicker.value);
        });
    }

    if (eraseBtn) {
        eraseBtn.addEventListener('click', () => {
            toggleEraser();
        });
    }

    if (fillBtn) {
        fillBtn.addEventListener('click', () => {
            fillClosedAreas();
        });
    }

    if (clearCanvasBtn) {
        clearCanvasBtn.addEventListener('click', () => {
            clearCanvas();
        });
    }

    if (increaseBrushSize) {
        increaseBrushSize.addEventListener('click', () => {
            brushSize += 5;
            if (canvas) {
                canvas.freeDrawingBrush.width = brushSize;
            }
        });
    }

    if (decreaseBrushSize) {
        decreaseBrushSize.addEventListener('click', () => {
            brushSize = Math.max(5, brushSize - 5);
            if (canvas) {
                canvas.freeDrawingBrush.width = brushSize;
            }
        });
    }

    if (increaseEraserSize) {
        increaseEraserSize.addEventListener('click', () => {
            eraserSize += 5;
            if (isErasing) {
                canvas.freeDrawingBrush.width = eraserSize;
            }
        });
    }

    if (decreaseEraserSize) {
        decreaseEraserSize.addEventListener('click', () => {
            eraserSize = Math.max(5, eraserSize - 5);
            if (isErasing) {
                canvas.freeDrawingBrush.width = eraserSize;
            }
        });
    }

    if (canvasImageInput) {
        canvasImageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                loadImageIntoCanvas(file);
            }
        });
    }

    // Função para converter Data URL para Blob
    function dataURLtoBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    // Salvar o desenho e anexá-lo ao input de arquivo
    if (saveDrawingBtn) {
        saveDrawingBtn.addEventListener('click', () => {
            const drawingDataURL = canvas.toDataURL(); // Obter o desenho como Data URL
            const drawingBlob = dataURLtoBlob(drawingDataURL); // Converter para Blob

            // Criar um arquivo a partir do Blob e anexá-lo ao input de arquivo
            const drawingFile = new File([drawingBlob], 'desenho.png', { type: 'image/png' });

            // Criar um DataTransfer para simular o upload do arquivo no input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(drawingFile);

            // Anexar o arquivo ao campo de input de arquivo
            postImageInput.files = dataTransfer.files;

            // Fechar o modal
            drawModal.style.display = 'none';

            // Limpar o canvas após o envio
            clearCanvas();
        });
    }
    // FABRIC.js fim


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
                if (studentName) {
                    localStorage.setItem('studentName', studentName);
                }
                
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
