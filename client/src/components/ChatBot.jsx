import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import "./ChatBot.css"
import { IoChatbubblesOutline } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import useUser from '../hooks/useUser';


const ChatBot = () => {
    const { user } = useUser()
    const [messages, setMessages] = useState([])
    const [state, setState] = useState(false)

    const chatboxRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(()=>{
        if (messages.length === 0) {
            const welcomeMessage = {
                name: "Abimanyu",
                message: "Hello! I am Abimanyu, How can I help you?"
            };
            setMessages([welcomeMessage]);
        }
    },[])

    const handleMessage = async() => {
        const text = inputRef.current.value;
        if (!text) return;

        const newUserChat = { name: `${user.name}`, message: text };
        setMessages((prevMessage) => [...prevMessage, newUserChat]);
        inputRef.current.value = "";

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text }]
                            }
                        ]
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text(); // to debug non-JSON error
                console.error("Non-200 response from Gemini:", response.status, errorText);
                throw new Error(`API error: ${response.status}`);
            }

            const res = await response.json();

            const botMessage =
                res?.candidates?.[0]?.content?.parts?.[0]?.text ||
                "Sorry, I couldn't generate a response.";

            const newBotMessage = { name: "Abimanyu", message: botMessage };
            setMessages((prevMessage) => [...prevMessage, newBotMessage]);
        } catch (err) {
            console.error("Gemini API error:", err.message);
            const errorBotMessage = {
                name: "Abimanyu",
                message: "Oops! Something went wrong. Please try again later.",
            };
            setMessages((prevMessage) => [...prevMessage, errorBotMessage]);
        }
    }

    const handleState = (e) => {
        e.preventDefault()
        setState((prev) => !prev)
        try {
            if (!state) {
                chatboxRef.current.classList.add('chatbox--active')
            } else {
                chatboxRef.current.classList.remove('chatbox--active')
            }
        } catch (error) {
            console.log(chatboxRef.current)
            console.error(error.message)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleMessage()
        }
    }

    useEffect(() => {
    }, [messages])

    return (
        <div className="chatbox-container">
            <div className="chatbox">
                <div className="chatbox__support" ref={chatboxRef}>
                    <div className="chatbox__header">
                        <div className="chatbox__image--header">
                            <img src="https://res.cloudinary.com/dkfrxnaud/image/upload/v1742718162/WhatsApp_Image_2025-03-23_at_13_34_44_3c46ab4e-photoaidcom-cropped-removebg-preview-photoaidcom-cropped-photoaidcom-cropped_jivyig.png" alt="image" />
                        </div>
                        <div className="chatbox__content--header">
                            <h4 className="chatbox__heading--header">Chat support</h4>
                        </div>
                    </div>
                    <div className="chatbox__messages">
                        {messages.slice().reverse().map((message, index) => (
                            <div key={index} className={`messages__item messages__item--${message.name === "Abimanyu" ? "visitor" : "operator"}`}>
                                {message.message}
                            </div>
                        ))}
                    </div>
                    <div className="chatbox__footer">
                        <input type="text" placeholder="Write a message..." ref={inputRef} onKeyDown={handleKeyPress} />
                        <button className="chatbox__send--footer send__button" onClick={handleMessage}><IoMdSend /></button>
                    </div>
                </div>
                <div className="chatbox__button">
                    <button onClick={handleState}><IoChatbubblesOutline /></button>
                </div>
            </div>
        </div>
    )
}

export default ChatBot