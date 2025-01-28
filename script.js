// Configuration Firebase et variables
const firebaseConfig = {
    apiKey: "AIzaSyDpqVy49t7oq06gFZqUJ50T863iQHi0f-s",
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
  
  // Limite quotidienne pour les requêtes Google
  const MAX_REQUESTS_PER_DAY = 100;
  let requestCount = localStorage.getItem("requestCount") || 0;
  let lastRequestDate = localStorage.getItem("lastRequestDate") || new Date().toDateString();
  
  if (lastRequestDate !== new Date().toDateString()) {
    requestCount = 0;
    localStorage.setItem("lastRequestDate", new Date().toDateString());
  }
// Gestion du nom de l'utilisateur
let userName = localStorage.getItem("userName");



// Fonction pour afficher un message dans le chat
function displayMessage(sender, message) {
    const messagesDiv = document.getElementById("messages");
    const newMessage = document.createElement("p");
    newMessage.classList.add(sender);
    newMessage.innerHTML = `<b>${sender === "user" ? "Vous" : "IA"} :</b> ${message}`;
    messagesDiv.appendChild(newMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Fonction pour choisir une réponse aléatoire
function getDynamicResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

// Fonction pour poser une question de précision 
async function askClarification(query) {
    const clarification = prompt(`Tu recherches "${query}". Peux-tu préciser ?`);
    if (clarification) {
        await searchInternet(clarification);
    } else {
        displayMessage("bot", "D'accord, je laisse tomber cette recherche.");
    }
}

// Fonction pour effectuer une recherche Internet
async function searchInternet(query) {
    if (requestCount >= MAX_REQUESTS_PER_DAY) {
        displayMessage('bot', "Désolé, je ne peux plus effectuer de recherches aujourd'hui. Essayez demain !");
        return;
    }

    requestCount++;
    localStorage.setItem("requestCount", requestCount);

    const apiKey = 'AIzaSyDpqVy49t7oq06gFZqUJ50T863iQHi0f-s';
    const searchEngineId = 'a1531162ca27b489a';
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${apiKey}&cx=${searchEngineId}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const firstResult = data.items[0];
            displayMessage('bot', `Voici ce que j'ai trouvé :<br><strong>${firstResult.title}</strong><br><a href="${firstResult.link}" target="_blank">Voir le résultat</a>`);
        } else {
            displayMessage('bot', "Désolé, je n'ai trouvé aucun résultat.");
        }
    } catch (error) {
        console.error('Erreur lors de la recherche :', error);
        displayMessage('bot', "Désolé, je ne peux pas effectuer la recherche en ce moment.");
    }
}

// Fonction principale pour gérer les réponses
function handleResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();
    let response = "Je ne comprends pas cette question... 😅";

    if (!userName) {
        userName = userMessage;
        localStorage.setItem("userName", userName);
        response = `Enchanté, ${userName} ! Tu peux taper 'aide' pour découvrir mes fonctionnalités.`;
    } else {
        const rules = {
            "bonjour": [
                `Salut ${userName} ! Comment vas-tu ?`,
                `Bonjour ${userName} ! Que puis-je faire pour toi ?`,
                `Hello ${userName}, prêt à discuter ?`
            ],
            "salut": ["Salut ! 😊", "Hello ! 👋", "Hey ! Comment ça va ?"],
            "heure": () => {
                const now = new Date();
                return `Il est ${now.getHours()}h${now.getMinutes()} !`;
            },
            "pile ou face": () => {
                return Math.random() < 0.5 ? "Pile" : "Face";
            },
            "merci": ["Avec plaisir ! 😊", "De rien ! 😎", "Tout le plaisir est pour moi ! 😇"],
            "aide": () => {
                return `<ul>
                    <li>Donner l'heure en tapant 'heure'.</li>
                    <li>Jouer à pile ou face avec 'pile ou face'.</li>
                    <li>Faire des calculs simples comme '5 + 3' ou '12 * 4'.</li>
                    <li>Effectuer des recherches Internet avec 'recherche [sujet]'.</li>
                    <li>Saluer avec 'bonjour' ou 'salut'.</li>
                </ul>`;
            },
            "blague": () => {
                getJoke();
                return "Je vais chercher une blague pour toi...";
            },
            "ok": ["OK ! 👍", "C'est noté !", "D'accord ! 😊"],
            "d'accord": ["Parfait ! 😁", "Entendu !", "Super ! 👍"],
            "super": ["Génial ! 😊", "Trop bien ! 😄", "Je suis content que ça te plaise !"],
            "cool": ["Oui, trop cool ! 😎", "Carrément ! 😁", "Super cool !"],
            "top": ["Au top ! 😄", "Nickel ! 👍", "Yes, au max !"],
            "recherche": () => {
                response = "Tu veux chercher quelque chose ? Donne-moi plus de précisions !";
            }
        };

        for (const [key, value] of Object.entries(rules)) {
            if (message.includes(key)) {
                response = typeof value === "function" ? value() : getDynamicResponse(value);
                break;
            }
        }

        // Gestion des calculs simples
        if (/^\d+\s*[-+*/]\s*\d+$/.test(message)) {
            try {
                const result = eval(message);
                response = `Le résultat est ${result}.`;
            } catch {
                response = "Je n'ai pas compris ce calcul.";
            }
        }

        // Gestion des recherches Internet
        if (message.startsWith("recherche ")) {
            const searchQuery = message.replace("recherche ", "");
            response = `Recherche en cours pour : "${searchQuery}"...`;
            askClarification(searchQuery);
            return;
        }
    }

    displayMessage("bot", response);
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

// Message d'accueil
if (!userName) {
    displayMessage("bot", "Bonjour ! Comment t'appelles-tu ? (Tu peux taper 'aide' pour découvrir mes fonctionnalités)");
} else {
    displayMessage("bot", `Rebonjour ${userName} ! Que puis-je faire pour toi aujourd'hui ? Tape 'aide' si tu as besoin d'infos.`);
}

// Fonction pour basculer entre le mode sombre et clair
document.getElementById("themeToggle").addEventListener("click", function() {
    const body = document.body;
    const container = document.getElementById("container");
    const chatbox = document.getElementById("chatbox");


    if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        container.classList.remove("dark-mode");
        container.classList.add("light-mode");
        chatbox.classList.remove("dark-mode");
        chatbox.classList.add("light-mode");
        this.textContent = "Passer en mode sombre";
    } else {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        container.classList.remove("light-mode");
        container.classList.add("dark-mode");
        chatbox.classList.remove("light-mode");
        chatbox.classList.add("dark-mode");
        this.textContent = "Passer en mode clair";
    }
});

// Fonction pour récupérer une blague
async function getJoke() {
    const url = "https://v2.jokeapi.dev/joke/Any?type=single";
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.joke) {
            displayMessage('bot', data.joke);
        } else {
            displayMessage('bot', "Désolé, je n'ai pas trouvé de blague.");
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la blague :', error);
        displayMessage('bot', "Désolé, je ne peux pas récupérer de blague pour le moment.");
    }
}
