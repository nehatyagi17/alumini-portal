import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;
const connectedUsers = new Map(); // Map userId -> socketId

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:5173',
                process.env.FRONTEND_URL
            ].filter(Boolean),
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected via socket: ${socket.userId} (Socket ID: ${socket.id})`);
        
        // Add user to connected users map
        connectedUsers.set(socket.userId, socket.id);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            // Remove user from connected users map
            if (connectedUsers.get(socket.userId) === socket.id) {
                connectedUsers.delete(socket.userId);
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Helper function to emit to a specific user
export const emitToUser = (userId, event, data) => {
    const socketId = connectedUsers.get(userId);
    if (socketId && io) {
        io.to(socketId).emit(event, data);
        return true;
    }
    return false;
};
