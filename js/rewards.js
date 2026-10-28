import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
const button=document.querySelector("#claim-reward"), message=document.querySelector("#reward-message");
const configured=firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_") && firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("YOUR_");
let auth=null, db=null, currentUser=null;
function say(text,error=false){if(message){message.textContent=text;message.style.color=error?"#ff9999":"#ffd873";}}
if(configured){try{const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);onAuthStateChanged(auth,user=>{currentUser=user;if(button)button.textContent=user?"Claim today's reward ↗":"Sign in to claim ↗";});}catch(e){console.error(e);say("Firebase could not initialize. Check js/config.js.",true);}}
else say("Firebase is not configured yet. Set up js/config.js to enable sign-in and claim recording.",true);
button?.addEventListener("click",async()=>{
 if(!configured||!auth||!db){say("Firebase is not configured yet. Add your Firebase web settings first.",true);return;}
 if(!currentUser){location.href="account.html?next=rewards.html";return;}
 const day=new Date().toISOString().slice(0,10); const claimId=`${currentUser.uid}_${day}`; const ref=doc(db,"dailyClaims",claimId);
 button.disabled=true;
 try{await runTransaction(db,async tx=>{const old=await tx.get(ref);if(old.exists())throw new Error("ALREADY_CLAIMED");tx.set(ref,{uid:currentUser.uid,claimedDate:day,rewardId:"daily_login_100_credits",status:"pending_game_integration",createdAt:serverTimestamp()});});say("Daily claim recorded! In-game delivery is not enabled yet, so no items or credits have been added to the game.");button.textContent="Claim recorded ✓";}
 catch(e){if(e.message==="ALREADY_CLAIMED")say("You've already claimed today's reward. Come back tomorrow.");else if(e.code==="permission-denied")say("Claim blocked by Firestore rules. Publish the dailyClaims rule from firestore.rules.",true);else{console.error(e);say("Couldn't record the claim. Check your connection and Firebase rules.",true);}}
 finally{button.disabled=false;}
});
