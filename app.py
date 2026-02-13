from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

API_USER = "YOUR_API_USER"
API_SECRET = "YOUR_API_SECRET"

@app.route("/check", methods=["POST"])
def check():

    file = request.files["file"]

    response = requests.post(
        'https://api.sightengine.com/1.0/check.json',
        files={'media': file},
        data={
            'models': 'genai',
            'api_user': API_USER,
            'api_secret': API_SECRET
        }
    )

    result = response.json()

    confidence = result["type"]["ai_generated"] * 100

    if confidence > 50:
        verdict = "AI Generated"
    else:
        verdict = "Real"

    return jsonify({
        "verdict": verdict,
        "confidence": confidence
    })

app.run()
