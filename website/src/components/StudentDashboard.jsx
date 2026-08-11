import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

function StudentDashboard() {
    const [user, setUser] = useState(null);
    const [flags, setFlags] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("[Student Dashboard] Auth user:", currentUser);

            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="page">
            <section className="hero">
                <h1>
                    Student Dashboard - {user ? user.email : "Not logged in."}
                </h1>
            </section>
        </div>
    );
}

export default StudentDashboard;