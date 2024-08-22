const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const os = require('os');

const app = express();
const port = 3000;
const roomsDir = path.join(`${__dirname}/public`, 'rooms');

// Função para garantir que o diretório rooms exista
function ensureRoomsDirExists() {
    if (!fs.existsSync(roomsDir)) {
        fs.mkdirSync(roomsDir, { recursive: true });
    }
}

app.use(express.json());
app.use(express.static('public'));
app.use('/rooms', express.static(path.join(__dirname, 'rooms')));

app.set('trust proxy', true); // Isso faz com que o Express confie nos cabeçalhos de proxy

// Função para obter o IP do usuário
function getUserIP(req) {
    // Extrai o IP do cabeçalho X-Forwarded-For, se disponível
    const forwardedFor = req.headers['x-forwarded-for'];
    
    if (forwardedFor) {
        // O cabeçalho pode conter uma lista de IPs separados por vírgula
        const ips = forwardedFor.split(',');
        return ips[0].trim(); // Retorna o primeiro IP da lista
    }
    
    // Caso contrário, usa o IP da conexão direta
    const ip = req.connection.remoteAddress || req.socket.remoteAddress || '';
    console.log("IP: ", ip);
    // Remove o prefixo "::ffff:" se for um endereço IPv4 em formato IPv6
    return ip.startsWith('::ffff:') ? ip.substring(7) : ip;
}

// Configuração do multer
const upload = multer({
    dest: 'public/uploads/', // Diretório onde os arquivos são armazenados temporariamente
    limits: { fileSize: 1024 * 1024 }, // Limite de 1MB para o tamanho do arquivo
});

// Middleware para tratar erros do multer
function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'Arquivo excede o tamanho máximo permitido de 1MB.' });
        }
    } else if (err) {
        return res.status(500).json({ error: 'Ocorreu um erro ao processar o upload.' });
    }
    next();
}

// rota no server.js para obter o IP do cliente:
app.get('/get-client-ip', (req, res) => {
    res.json({ ip: getUserIP(req) });
});

//Atualizando server.js para verificar o IP e redirecionar:
app.get('/checkRoom/:roomCode', (req, res) => {
    const roomCode = req.params.roomCode;
    const userIP = getUserIP(req); // Obtém o IP do usuário

    fs.readFile(path.join(roomsDir, `${roomCode}.json`), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao carregar sala' });
        }

        const roomData = JSON.parse(data);

        if (roomData.creatorIP === userIP) {
            res.redirect(`/master.html?room=${roomCode}`);
        } else {
            res.redirect(`/room.html?room=${roomCode}`);
        }
    });
});

// Criação de uma sala
app.post('/create-room', (req, res) => {
    const roomName = req.body.roomName;
    const authorName = req.body.authorName;
    const creatorIP = getUserIP(req);
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const roomData = {
        name: roomName,
        creator: { name: authorName, ip: creatorIP },
        creatorIP: creatorIP,
        code: roomCode,
        posts: [],
    };

    // Garantir que o diretório rooms exista
    ensureRoomsDirExists();

    // Salvar os dados da sala no arquivo JSON
    fs.writeFileSync(path.join(roomsDir, `${roomCode}.json`), JSON.stringify(roomData, null, 4)); // Formatado com indentação de 4 espaços
    res.json({ success: true, roomCode });
});

// Postagem de conteúdo em uma sala
app.post('/rooms/:roomCode/posts', upload.single('image'), (req, res) => {
    const roomCode = req.params.roomCode;
    const text = req.body.text;
    const imageFile = req.file; // Use `req.file` para acessar o arquivo enviado
    const timestamp = req.body.timestamp;
    
    const roomPath = path.join(roomsDir, `${roomCode}.json`);
    
    if (fs.existsSync(roomPath)) {
        const roomData = JSON.parse(fs.readFileSync(roomPath));
        
        const post = {
            text,
            image: imageFile ? `data:${imageFile.mimetype};base64,${fs.readFileSync(imageFile.path, 'base64')}` : null,
            date: new Date(parseInt(timestamp)),
            authorName: 'Estudante',
            authorIp: getUserIP(req), // Obtém o IP do usuário
        };

        roomData.posts.push(post);
        fs.writeFileSync(roomPath, JSON.stringify(roomData, null, 4)); // Formatado com indentação de 4 espaços
        
        // Excluir o arquivo temporário após processamento
        if (imageFile) {
            fs.unlink(imageFile.path, err => {
                if (err) {
                    console.error('Erro ao excluir arquivo temporário:', err);
                }
            });
        }

        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'Sala não encontrada' });
    }
}, multerErrorHandler);

// Obtenção de posts de uma sala
app.get('/rooms/:roomCode/posts', (req, res) => {
    const roomCode = req.params.roomCode;
    const roomPath = path.join(roomsDir, `${roomCode}.json`);

    if (fs.existsSync(roomPath)) {
        const roomData = JSON.parse(fs.readFileSync(roomPath));
        res.json(roomData);
    } else {
        res.status(404).json({ error: 'Sala não encontrada' });
    }
});

// Lista de salas criadas
app.get('/get-room-list', (req, res) => {
    const roomFiles = fs.readdirSync(roomsDir);
    const rooms = roomFiles.map(file => {
        const roomData = JSON.parse(fs.readFileSync(path.join(roomsDir, file)));
        return { name: roomData.name, code: roomData.code, creator: roomData.creator };
    });
    res.json(rooms);
});

// Excluir uma sala
app.delete('/delete-room/:code', (req, res) => {
    const roomCode = req.params.code;
    const filePath = path.join(roomsDir, `${roomCode}.json`); 

    fs.unlink(filePath, err => {
        if (err) {
            console.error('Erro ao excluir sala:', err);
            return res.status(500).json({ error: 'Erro ao excluir sala' });
        }
        res.json({ success: true });
    });
});

app.post('/logout', (req, res) => {
    // Implemente a lógica de logout se necessário
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});