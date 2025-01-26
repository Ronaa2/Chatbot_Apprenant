from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

# Fichier de données (JSON)
DATA_FILE = "chat_data.json"

# Charger ou initialiser la base de données
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump({}, f)

# Fonction pour charger les données
def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

# Fonction pour sauvegarder les données
def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

# Route pour gérer les requêtes utilisateur
@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "").lower()
    data = load_data()

    # Si la question existe déjà dans la base
    if user_message in data:
        return jsonify({"response": data[user_message]})

    # Si la question n'existe pas, demander à l'utilisateur d'enseigner
    bot_response = "Je ne sais pas encore répondre à cette question. Quelle est la bonne réponse ?"
    data[user_message] = bot_response  # Enregistrer temporairement
    save_data(data)
    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(debug=True)
