import { useState } from "react"; // remembers info that can change
import { doc, setDoc } from "firebase/firestore"; // firestore ref/path
import { db } from "../firebase"; // firestore database
import "../index.css"; // stylesheet

function ProfileSetup ({ user, onComplete }) { // React component; recieves "props" from parent (App.jsx)
    const [role, setRole] = useState(""); // current value/function that changes it
    const [saving, setSaving] = useState(false); // loading flag

    const handleSubmit = async (event) => {
        event.preventDefault(); // let us do it not default HTML way

        if (!role) {
            return;
        }

        setSaving(true); // saving on

        try{
            const userRef = doc(db, "users", user.uid); // creating firestore doc ref

            await setDoc(userRef, { // firestore write
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: role,
                groups: [],
                relationships: {},
                createdAt: new Date().toISOString()
            });

            console.log("[Profile Setup] Profile created.");

            onComplete(); // done
        } catch (error) {
            console.error("[Profile Setup] Failed to create profile:", error);
        } finally {
            setSaving(false); // saving off
        }
    };

    return ( // acutal UI
        <div className="page">
            <section className="hero">
                <h1>Welcome to Druid</h1>

                <p className="hero-sub">
                    Before you continue: how will you be using Druid?
                </p>

                <form onSubmit={handleSubmit}>

                    <div> {/* role buttons */}
                        <button
                            type="button"
                            className={role=="student" ? "btn-primary" : "btn-ghost"}
                            onClick={() => setRole("student")}
                        >
                            Student
                        </button>

                        <button
                            type="button"
                            className={role=="teacher" ? "btn-primary" : "btn-ghost"}
                            onClick={() => setRole("teacher")}
                        >
                            Teacher
                        </button>

                        <button
                            type="button"
                            className={role=="guardian" ? "btn-primary" : "btn-ghost"}
                            onClick={() => setRole("guardian")}
                        >
                            Guardian
                        </button>                      
                    </div>

                    <br />

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={!role || saving} // disable if role not selected/already saving
                    >
                        {saving ? "Setting up..." : "Continue"} {/* saving on=setting up; off=cont */}
                    </button>

                </form>
            </section>
        </div>
    );
}

export default ProfileSetup;