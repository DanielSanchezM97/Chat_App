const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// ! Get username and room from URL

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// ! Join chatroom
socket.emit("joinRoom", { username, room });

// ! Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// ? Message from the server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  // ? Scroll to the bottom of the page
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// ! Message form submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // ? Getting the text from the message form
  const msg = e.target.elements.msg.value; // ? msg is the id of the input

  // ? Emit the message to the server
  socket.emit("chatMessage", msg);

  // ? Clear the input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// ! Output message to the DOM

function outputMessage(message) {
  const div = document.createElement("div");
  if (message.username === username) {
    div.classList.add("message", "right");
  } else if (message.username === "Admin") {
    div.classList.add("message", "admin");
  } else {
    div.classList.add("message", "left");
  }
  div.innerHTML = `<p class=${
    message.username === username
      ? "myMeta"
      : message.username === "Admin"
      ? "meta"
      : "personMeta"
  }>${message.username === username ? "You" : message.username} <span>${
    message.time
  }</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// ! Add room names to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// ! Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}
