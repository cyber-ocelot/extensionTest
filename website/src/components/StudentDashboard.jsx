import { useEffect, useState } from "react";
//import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function StudentDashboard({ user }) {
    //const [user, setUser] = useState(null);
    const [flags, setFlags] = useState([]);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];

        // ref to todays doc
        const dayRef = doc(
            db,
            "users",
            user.uid,
            "dates",
            today
        );
        
        // read todays doc from firestore
        const loadFlags = async () => {
            const snap = await getDoc(dayRef);

            // handle data
            if (snap.exists()) {
                const data = snap.data();

                setFlags(data.flags ?? []);
            }
        };

        loadFlags();
    }, [user]);

    return (
        <div className="page">
            <section className="hero">
                <h1>Student Dashboard</h1>

                <p className="hero-sub">
                    Signed in as {user.displayName}
                </p>

                <h2>Today's Flags</h2>

                <div className="flag-list">
                    {flags.map((flag, index) => (
                        <div className="flag-card" key={index}>
                            <h3>{flag.event}</h3>

                            <p>
                                <strong>Site:</strong> {flag.aiSite}
                            </p>

                            <p>
                                <strong>Prompt:</strong> {flag.prompt}
                            </p>

                            <p>
                                <strong>Time:</strong> {flag.timestamp}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
        
        /*<div className="page">
            <section className="hero">
                <h1>
                    Student Dashboard - {user ? user.email : "Not logged in."}
                </h1>
            </section>
        </div>*/
    );
}

export default StudentDashboard;