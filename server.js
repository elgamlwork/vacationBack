const express = require('express');
const socketIo = require('socket.io');
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const server = require('http').createServer(app);
const io = socketIo(server, {
    cors: {
        origin:"*"
    }
});
require('dotenv').config();
const authRoute = require('./routes/authRoute');
const userRouter = require('./routes/userRouter');
const postRoute = require('./routes/postRoute');
const commentRoute = require('./routes/commentRoute');
const replyCommentRoute = require('./routes/replyCommentRoute');
const dataBaseConnection = require('./config/dataBase');
const { handleError, foundError } = require('./middlewares/errorMiddlewares/errorMiddleware');
dataBaseConnection();

app.use(cors({
    origin: "*",
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', authRoute);
app.use('/api', userRouter);
app.use('/api', postRoute);
app.use('/api', commentRoute);
app.use('/api', replyCommentRoute);
app.use(foundError);
app.use(handleError);



const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log('server is started at port :5000');
});

let onlineUsers = [];

const addNewUser = (email, socketId) => {
    !onlineUsers.some(user => user.email === email) &&
        onlineUsers.push({ email, socketId });
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => {
        if (user?.socketId !== socketId) {
            return user;
        }
    })
} 

const getUser = (email) => {
    return onlineUsers.find(user => user?.email === email);
}

io.on("connection", (socket) => {
    
    socket.on("newUser", (user) => {
        addNewUser(email = user?.email, socket.id);
    })
    socket.on("event", ({ sender, receiver, type }) => {
        const Receiver = getUser(receiver?.userId.email);
        io.to(Receiver?.socketId)
            .emit("sendEvent", { sender, receiver, type });
    })
    socket.on("disconnect", () => {
        removeUser(socket.id);
    });
});