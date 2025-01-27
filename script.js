// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDi9e0lS8CLhpmdoMos4BIuMUiw6WzNUA4",
    authDomain: "chatbot-a5870.firebaseapp.com",
    databaseURL: "https://chatbot-a5870-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "chatbot-a5870",
    storageBucket: "chatbot-a5870.firebasestorage.app",
    messagingSenderId: "236735146201",
    appId: "1:236735146201:web:9a064f9def5194fd27b6c8",
    measurementId: "G-SB2JRQWTYT"
};

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Gestion des réponses
function handleResponse(userMessage) {
    const ref = database.ref('questions/' + userMessage.toLowerCase());
    ref.get().then((snapshot) => {
        if (snapshot.exists()) {
            displayMessage("bot", snapshot.val());
        } else {
            askForHelp(userMessage);
        }
    }).catch((error) => {
        console.error("Erreur lors de la récupération des données Firebase :", error);
        displayMessage("bot", "Je ne peux pas accéder à la base de données pour le moment.");
    });
}

// Demande à l'utilisateur d'ajouter une réponse
function askForHelp(question) {
    let answer = prompt(`Je ne connais pas la réponse à : "${question}". Peux-tu m'aider ?`);
    if (answer) {
        saveToFirebase(question, answer);
    }
}

// Sauvegarde une question/réponse dans Firebase
function saveToFirebase(question, answer) {
    const ref = database.ref('questions/' + question.toLowerCase());
    ref.set(answer, (error) => {
        if (error) {
            console.error("Erreur d'enregistrement dans Firebase :", error);
            displayMessage("bot", "Je n'ai pas pu enregistrer la réponse.");
        } else {
            displayMessage("bot", "Merci ! J'ai enregistré cette réponse.");
        }
    });
}

// Affiche un message dans le chat
function displayMessage(sender, message) {
    const messagesDiv = document.getElementById("messages");
    const newMessage = document.createElement("p");
    newMessage.classList.add(sender); // "user" ou "bot"
    newMessage.innerHTML = `<b>${sender === "user" ? "Vous" : "IA"} :</b> ${message}`;
    messagesDiv.appendChild(newMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll automatique
}

// Gestion de l'entrée utilisateur
document.getElementById("userMessage").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const userMessage = document.getElementById("userMessage").value.trim();
        if (userMessage) {
            displayMessage("user", userMessage);
            document.getElementById("userMessage").value = '';
            handleResponse(userMessage);
        }
    }
});

messagesDiv.scrollTop = messagesDiv.scrollHeight;
