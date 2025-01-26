async function envoyerMessage(message) {
    const response = await fetch("https://backend-2-qxnl.onrender.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: message }),
    });
    const data = await response.json();

    if (data.unknown) {
        const nouvelleReponse = prompt("Je ne connais pas cette réponse. Peux-tu m'apprendre ?");
        if (nouvelleReponse) {
            await fetch("https://backend-2-qxnl.onrender.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: message, reponse: nouvelleReponse }),
            });
            alert("Merci ! J'ai appris quelque chose de nouveau.");
        }
    } else {
        afficherReponse(data.reponse);
    }
}
