from flask import Flask, render_template, session, redirect, url_for
import os

# Set up paths for HTML and static files
template_folder_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'html')
static_folder_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')

app = Flask(__name__, template_folder=template_folder_path, static_folder=static_folder_path)
app.secret_key = 'supersecretkey'  # Secure session management

# Firebase project settings
FIREBASE_URL = 'https://primeroastweb-default-rtdb.asia-southeast1.firebasedatabase.app'
FIREBASE_API_KEY = 'AIzaSyD29zvJ5gOvHRgk1qUWFzZJL8foY1sf8bk'

# Route to landing page; redirects to home if logged in
@app.route('/')
def landing():
    return render_template('landingpage.html')

# Route to home page, only accessible if logged in
@app.route('/home')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True, port=5001)
