from flask import Flask, request

app = Flask(__name__)

@app.route('/', methods=["POST", "GET"])
def webhook():
    if request.method == "GET":
        return "get working"
    elif request.method == "POST":
        payload = request.json
        print(payload)
        return "message received"
    else:
        print(request.data)
        return "200"
    
if __name__ == '__main__':
    app.run(debug=True)