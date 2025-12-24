let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function emitToConference(conferenceId, event, payload) {
  if (!ioInstance) return;
  const room = `conference-${conferenceId.toString()}`;
  ioInstance.to(room).emit(event, payload);
}

module.exports = {
  setIO,
  emitToConference,
};


