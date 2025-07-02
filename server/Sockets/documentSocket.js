// module.exports = function (io) {
//   io.on("connection", (socket) => {
//     console.log("New user connected:", socket.id);

//     socket.on("join-room", (documentId) => {
//       socket.join(documentId);
//       console.log(`User ${socket.id} joined room ${documentId}`);
//     });

//     socket.on("send-changes", ({ documentId, content }) => {
//       socket.to(documentId).emit("receive-changes", content);
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//     });
//   });
// };
