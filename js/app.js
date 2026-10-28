import { firebaseConfig } from "./config.js";
import { initGameBridge } from "./game-bridge.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const header = $("#site-header");
const footer = $("#site-footer");
const navItems = [["Home","index.html"],["Play","play.html"],["Occupations","occupations.html"],["Game Account","game-account.html"],["Community","community.html"],["Daily Rewards","rewards.html"],["Store","store.html"],["News","news.html"],["Support","support.html"]];
const current = location.pathname.split("/").pop() || "index.html";
if (header) {
  header.innerHTML = `<header class="site-header"><div class="nav-inner"><a class="brand" href="index.html"><img class="brand-logo" src="assets/gerp-logo.png" alt="Global Era Roleplay logo"><span>GLOBAL ERA<small>ROLEPLAY / BORT STUDIOS</small></span></a><button class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-label="Toggle navigation">☰</button><nav class="nav-links" id="nav-links">${navItems.map(([n,u])=>`<a href="${u}" ${current===u?'aria-current="page"':""}>${n}</a>`).join("")}</nav><div class="nav-actions"><a class="btn btn-ghost" href="account.html">Sign in</a><a class="btn btn-primary" href="account.html">Player account ↗</a></div></div></header>`;
  $("#menu-toggle")?.addEventListener("click",()=>{const nav=$("#nav-links");const open=nav.classList.toggle("open");$("#menu-toggle").setAttribute("aria-expanded",String(open));});
}
if (footer) footer.innerHTML = `<footer class="site-footer"><div class="footer-inner"><a class="brand" href="index.html"><img class="brand-logo" src="assets/gerp-logo.png" alt="Global Era Roleplay logo"><span>GLOBAL ERA<small>ROLEPLAY / BORT STUDIOS</small></span></a><div class="footer-links">${navItems.map(([n,u])=>`<a href="${u}">${n}</a>`).join("")}<a href="admin.html">Staff</a></div><p>© ${new Date().getFullYear()} Global Era RP · A BORT STUDIOS project</p></div></footer>`;

// Branded launch/loading screen (kept lightweight and accessible).
const loader = document.createElement("div");
loader.className = "gerp-loader";
loader.setAttribute("role", "status");
loader.setAttribute("aria-label", "Loading Global Era Roleplay");
loader.innerHTML = `<div class="loader-content"><img src="assets/gerp-logo.png" alt="" class="loader-logo"><span class="loader-kicker">BORT STUDIOS PRESENTS</span><strong>GLOBAL ERA <em>ROLEPLAY</em></strong><span class="loader-caption">YOUR STORY. YOUR WORLD.</span><div class="loader-track"><i></i></div><small class="loader-status">Entering Global Era...</small></div>`;
document.body.prepend(loader);
window.addEventListener("load", () => window.setTimeout(() => { loader.classList.add("loader-finished"); window.setTimeout(() => loader.remove(), 700); }, 1000), { once: true });

// Mobile Dynamic Island-style status pill. This is a website UI element, not OS integration.
const island = document.createElement("div");
island.className = "gerp-dynamic-island";
island.setAttribute("aria-label", "GERP live website status");
island.innerHTML = `<span class="island-dot"></span><span class="island-label">GERP ONLINE</span><span class="island-divider"></span><span class="island-action">WORLD PREVIEW</span>`;
document.body.append(island);
if (current === "rewards.html") {
  island.querySelector(".island-label").textContent = "DAILY REWARDS";
  island.querySelector(".island-action").textContent = "CHECK-IN";
} else if (current === "occupations.html") {
  island.querySelector(".island-label").textContent = "CAREER HUB";
  island.querySelector(".island-action").textContent = "9 PATHS";
}


let app=null, auth=null, db=null, firebaseReady=false;
const isConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_") && firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("YOUR_");
if (isConfigured) {
  try { app=initializeApp(firebaseConfig); auth=getAuth(app); db=getFirestore(app); firebaseReady=true; }
  catch (e) { console.error("Firebase initialization failed",e); }
}
function message(selector, text, error=false){const el=$(selector);if(el){el.textContent=text;el.style.color=error?"#ff9a9a":"#ffd873";}}
function firebaseNotice(){return "Firebase is not configured yet. Add your web app values in js/config.js and enable Email/Password in Firebase Console.";}

const authForm=$("#auth-form");
let authMode="login";
function setAuthMode(mode){
  authMode=mode;
  document.querySelectorAll(".auth-tabs .tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  $("#confirm-wrap").hidden=mode!=="register";
  $("#auth-submit").textContent=mode==="register"?"Create account ↗":"Sign in ↗";
  $("#reset-password").hidden=mode==="register";
  $("#password").autocomplete=mode==="register"?"new-password":"current-password";
  message("#auth-message","");
}
document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>setAuthMode(b.dataset.mode)));
if(authForm){
  authForm.addEventListener("submit",async e=>{
    e.preventDefault();
    if(!firebaseReady){message("#auth-message",firebaseNotice(),true);return;}
    const email=$("#email").value.trim(), password=$("#password").value;
    try{
      $("#auth-submit").disabled=true;
      if(authMode==="register"){
        if(password!==$("#confirm-password").value){message("#auth-message","Passwords do not match.",true);return;}
        await createUserWithEmailAndPassword(auth,email,password);
        message("#auth-message","Account created. You are signed in.");
      }else{await signInWithEmailAndPassword(auth,email,password);message("#auth-message","Signed in successfully.");}
    }catch(err){message("#auth-message",friendlyAuthError(err.code),true);}
    finally{$("#auth-submit").disabled=false;}
  });
}
function friendlyAuthError(code){const m={"auth/email-already-in-use":"An account already uses this email.","auth/invalid-email":"Enter a valid email address.","auth/weak-password":"Choose a stronger password (at least 8 characters).","auth/invalid-credential":"Email or password is incorrect.","auth/too-many-requests":"Too many attempts. Please try again later.","auth/network-request-failed":"Network error. Check your connection."};return m[code]||"Could not complete the request. Check your details and try again.";}
$("#reset-password")?.addEventListener("click",async()=>{if(!firebaseReady){message("#auth-message",firebaseNotice(),true);return;}const email=$("#email").value.trim();if(!email){message("#auth-message","Enter your email address first.",true);return;}try{await sendPasswordResetEmail(auth,email);message("#auth-message","If the address is registered, a reset email should arrive shortly.");}catch(e){message("#auth-message",friendlyAuthError(e.code),true);}});
$("#sign-out")?.addEventListener("click",async()=>{if(auth)try{await signOut(auth);}catch(e){message("#auth-message","Could not sign out.",true);}});
if($("#auth-form")){
  if(!firebaseReady)message("#auth-message",firebaseNotice(),true);
  if(auth)onAuthStateChanged(auth,user=>{if(user){$("#auth-form").hidden=true;$("#account-panel").hidden=false;$("#account-email").textContent=`Signed in as ${user.email||"player"}`;}else{$("#auth-form").hidden=false;$("#account-panel").hidden=true;}});
}

const ticketForm=$("#ticket-form");
if(ticketForm)ticketForm.addEventListener("submit",async e=>{
  e.preventDefault();
  if(!firebaseReady){message("#ticket-message-status",firebaseNotice(),true);return;}
  const user=auth.currentUser;
  if(!user){message("#ticket-message-status","Please sign in on the Player Account page before submitting a ticket.",true);return;}
  const subject=$("#ticket-subject").value.trim(), category=$("#ticket-category").value, body=$("#ticket-message").value.trim();
  try{await addDoc(collection(db,"supportTickets"),{uid:user.uid,email:user.email||"",subject,category,message:body,status:"open",createdAt:serverTimestamp()});ticketForm.reset();message("#ticket-message-status","Request submitted. Keep an eye on your email/community for a response.");}
  catch(err){console.error(err);message("#ticket-message-status","Ticket could not be submitted. Check Firestore setup and security rules.",true);}
});

async function loadNews(){
  const list=$("#news-list");if(!list)return;
  if(!firebaseReady){message("#news-status","Showing sample content. Configure Firebase to load published announcements.");return;}
  try{
    const snap=await getDocs(query(collection(db,"announcements"),orderBy("createdAt","desc"),limit(20)));
    if(snap.empty){message("#news-status","No announcements have been published yet.");return;}
    list.innerHTML=snap.docs.map(d=>{const x=d.data();const title=escapeHtml(x.title||"Update"), body=escapeHtml(x.body||""), cat=escapeHtml(x.category||"News");let date="";if(x.createdAt?.toDate)date=x.createdAt.toDate().toLocaleDateString();return `<article class="news-item"><span class="tag">${cat}</span><h2>${title}</h2><p>${body}</p><small>${date}</small></article>`;}).join("");
    message("#news-status","");
  }catch(e){console.error(e);message("#news-status","Could not load announcements. Check Firestore rules and database setup.",true);}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("#refresh-news")?.addEventListener("click",loadNews);
loadNews();

const adminForm=$("#announcement-form");
if(adminForm){
  if(!firebaseReady){message("#admin-status",firebaseNotice(),true);}
  else onAuthStateChanged(auth,async user=>{
    if(!user){message("#admin-status","Sign in with an approved staff account. Admin access is required.",true);return;}
    try{const token=await user.getIdTokenResult(true);if(token.claims.admin===true){$("#admin-status").textContent=`Admin access verified for ${user.email||"staff"}.`;adminForm.hidden=false;}else message("#admin-status","Access denied. This account does not have the admin custom claim.",true);}
    catch(e){message("#admin-status","Could not verify admin access.",true);}
  });
  adminForm.addEventListener("submit",async e=>{
    e.preventDefault();const user=auth?.currentUser;if(!user){message("#admin-message","Please sign in again.",true);return;}
    try{const token=await user.getIdTokenResult(true);if(token.claims.admin!==true)throw new Error("Not an admin");await addDoc(collection(db,"announcements"),{title:$("#announcement-title").value.trim(),body:$("#announcement-body").value.trim(),category:$("#announcement-category").value,createdAt:serverTimestamp(),createdBy:user.uid});adminForm.reset();message("#admin-message","Announcement published.");}
    catch(e){console.error(e);message("#admin-message","Could not publish. Check admin claim and Firestore rules.",true);}
  });
}
initGameBridge();
