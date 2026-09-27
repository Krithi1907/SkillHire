import { useState } from "react";

function App() {
    const [message, setMessage] = useState("");

    const connectBackend = () => {
        fetch("http://localhost:5000/")
            .then(response => response.json())
            .then(data => {
                setMessage(data.message);
            })
            .catch(error => {
                console.error(error);
                setMessage("Backend connection failed");
            });
    };

    return (
        <div>
            <h1>SkillHire - Frontend is Working! 🔥</h1>

            <button onClick={connectBackend}>
                Connect to Backend
            </button>

            <h2>{message}</h2>
        </div>
    );
}

export default App;