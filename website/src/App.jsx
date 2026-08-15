/*
 * GNU AFFERO GENERAL PUBLIC LICENSE
 *                        Version 3, 19 November 2007
 * 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  Everyone is permitted to copy and distribute verbatim copies
 *  of this license document, but changing it is not allowed.
 * 
 *                             Preamble
 * 
 *   The GNU Affero General Public License is a free, copyleft license for
 * software and other kinds of works, specifically designed to ensure
 * cooperation with the community in the case of network server software.
 * 
 *   The licenses for most software and other practical works are designed
 * to take away your freedom to share and change the works.  By contrast,
 * our General Public Licenses are intended to guarantee your freedom to
 * share and change all versions of a program--to make sure it remains free
 * software for all its users.
 * 
 *   When we speak of free software, we are referring to freedom, not
 * price.  Our General Public Licenses are designed to make sure that you
 * have the freedom to distribute copies of free software (and charge for
 * them if you wish), that you receive source code or can get it if you
 * want it, that you can change the software or use pieces of it in new
 * free programs, and that you know you can do these things.
 * 
 *   Developers that use our General Public Licenses protect your rights
 * with two steps: (1) assert copyright on the software, and (2) offer
 * you this License which gives you legal permission to copy, distribute
 * and/or modify the software.
 * 
 *   A secondary benefit of defending all users' freedom is that
 * improvements made in alternate versions of the program, if they
 * receive widespread use, become available for other developers to
 * incorporate.  Many developers of free software are heartened and
 * encouraged by the resulting cooperation.  However, in the case of
 * software used on network servers, this result may fail to come about.
 * The GNU General Public License permits making a modified version and
 * letting the public access it on a server without ever releasing its
 * source code to the public.
 * 
 *   The GNU Affero General Public License is designed specifically to
 * ensure that, in such cases, the modified source code becomes available
 * to the community.  It requires the operator of a network server to
 * provide the source code of the modified version running there to the
 * users of that server.  Therefore, public use of a modified version, on
 * a publicly accessible server, gives the public access to the source
 * code of the modified version.
 * 
 *   An older license, called the Affero General Public License and
 * published by Affero, was designed to accomplish similar goals.  This is
 * a different license, not a version of the Affero GPL, but Affero has
 * released a new version of the Affero GPL which permits relicensing under
 * this license.
 */

import './App.css'; // stylesheets
import './index.css';

import { useEffect, useState } from 'react'; // react info handlers

import { onAuthStateChanged } from 'firebase/auth'; // firebase auth/data handlers
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore'; // firestore writes

import Login from './components/Login'; // React login interface components
import ProfileSetup from './components/ProfileSetup';

import StudentDashboard from './components/StudentDashboard'; // React dashoard components
import TeacherDashboard from './components/TeacherDashboard';
import GuardianDashboard from './components/GuardianDashboard';


function App() {
  const [ user, setUser ] = useState(null); // auth user info
  const [ loading, setLoading ] = useState(true);

  const [profile, setProfile] = useState(null); // user document/profile info
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) { // if no user logged in
        setProfile(null);
        setProfileLoading(false);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid); // gets firebase write
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) { // checks if user data exists
          setProfile(userSnap.data());
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("[App] Failed to load profile:", error);
      }

      setLoading(false); // loading off
      setProfileLoading(false);
    });

    return() => unsubscribe();
  }, []);

  if (loading) { // loading page
    return (
      <section className="hero">
          <h2 className="section-title">Loading Druid...</h2>
        </section>
    )
  }

  /*if (user) { // defaults to student dashboard for now
    return <StudentDashboard user={user}/>
    //return <Dashboard user={user} />
  }*/
  
  if (user && profileLoading) { // placeholder UI while profile data is loading
    return (
      <section className='hero'>
        <h2 className='section-title'>Loading profile...</h2>
      </section>
    );
  }

  if (user && !profile) { // profile doesn't exist
    return ( // new account for new user
      <ProfileSetup
        user={user}
        onComplete={async () => {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setProfile(userSnap.data());
          }
        }}
      />
    );
  }

  if (user && profile.role === "student") { // displays student dashboard if student
    return <StudentDashboard user={user} />;
  }

  if (user && profile.role === "teacher") { // displays teacher dashbaord if teacher
    return <TeacherDashboard user={user} />;
  }

  if (user && profile.role === "guardian") { // displays guardian dashboard if guardian
    return <GuardianDashboard user={user} />;
  }

  return ( // actual UI
    <>
      {/* Orbs */}
      <div className="orb-layer">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>

      {/* Nav */}
      <nav>
        <a href="index.html" className="nav-logo">Druid</a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How it works</a></li>
          <li><Login text={'Sign in'}/></li>
        </ul>
      </nav>

      <div className="page">

        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot"></span>
            Academic integrity, reimagined
          </div>
          <h1>Ancient wisdom.<br />Modern oversight.</h1>
          <p className="hero-sub">
            Druid watches over AI interactions in real time — quietly flagging academic dishonesty so educators and students can build trust, not just grades.
          </p>
          <div className="hero-actions">
            <Login text={'Get started now'}/>
            <a href="#how-it-works" className="btn-ghost">See how it works</a>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features" id="features">
          <p className="section-label">What Druid does</p>
          <h2 className="section-title">Everything you need to<br />monitor AI use honestly</h2>
          <div className="feature-grid">
            <div className="glass-card">
              <span className="feat-icon">🔍</span>
              <h3>Prompt detection</h3>
              <p>Identifies phrases that signal academic dishonesty — from "write my essay" to "give me the answer" — the moment they're typed.</p>
            </div>
            <div className="glass-card">
              <span className="feat-icon">📋</span>
              <h3>Copy/paste flagging</h3>
              <p>Catches when content is pasted directly into an AI chat, logging the event instantly with timestamp and site context.</p>
            </div>
            <div className="glass-card">
              <span className="feat-icon">🖼️</span>
              <h3>Image upload alerts</h3>
              <p>Detects when a student uploads an image — like a photo of homework — to an AI platform and flags it automatically.</p>
            </div>
            <div className="glass-card">
              <span className="feat-icon">📊</span>
              <h3>Personal dashboard</h3>
              <p>Students and teachers each see their own view — a running log of flags, counts, and context synced in real time.</p>
            </div>
            <div className="glass-card">
              <span className="feat-icon">☁️</span>
              <h3>Cloud sync</h3>
              <p>Everything saves to your account automatically. Switch devices, reinstall the extension — your data is always there.</p>
            </div>
            <div className="glass-card">
              <span className="feat-icon">🔒</span>
              <h3>Secure by default</h3>
              <p>Your data is stored privately under your own account. Teachers only see what students choose to share.</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how" id="how-it-works">
          <p className="section-label">Setup in minutes</p>
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">I</div>
              <div className="step-content">
                <h4>Create your account</h4>
                <p>Sign up as a student or teacher. Your account is the hub where all flag data gets stored and displayed.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">II</div>
              <div className="step-content">
                <h4>Install the Chrome extension</h4>
                <p>Add Druid to Chrome in one click. Sign in with the same account and the extension activates immediately.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">III</div>
              <div className="step-content">
                <h4>Druid watches in the background</h4>
                <p>On any AI platform — ChatGPT, Gemini, Claude — Druid monitors prompts, pastes, and uploads without interrupting your workflow.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">IV</div>
              <div className="step-content">
                <h4>Review your dashboard</h4>
                <p>Come back to this site anytime to see a full log of flagged events, sorted by time, type, and site.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-card">
            <h2>Ready to bring integrity back?</h2>
            <p>Join Druid and start monitoring AI use with clarity, fairness, and purpose.</p>
            <Login text={'Sign up now'}/>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer>
        <span>© 2026 Druid</span>
        <span><a href="#">Settings</a> · <a href="#">Privacy</a></span>
      </footer>
    </>
  );
}

export default App
