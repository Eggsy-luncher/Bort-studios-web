import { gameApiBaseUrl } from "./config.js";

// Frontend adapter only. Real linking, purchases, entitlements and game delivery must be enforced server-side.
export function initGameBridge(){
  const linkButton=document.querySelector("#start-game-link");
  const linkState=document.querySelector("#game-link-state");
  if(linkButton){
    if(!gameApiBaseUrl){linkButton.disabled=true;linkButton.title="Game backend not configured";linkButton.style.opacity=".55";}
    linkButton.addEventListener("click",async()=>{
      if(!gameApiBaseUrl){if(linkState)linkState.textContent="Not connected yet. A trusted game backend URL must be configured first.";return;}
      try{linkButton.disabled=true;if(linkState)linkState.textContent="Starting secure account linking…";
        const response=await fetch(`${gameApiBaseUrl.replace(/\/$/,"")}/account/link/start`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({returnUrl:location.origin+"/game-account.html"})});
        if(!response.ok)throw new Error("The linking service rejected the request.");const data=await response.json();
        if(data.authorizationUrl){location.href=data.authorizationUrl;}else if(linkState)linkState.textContent="Linking started, but the backend did not return an authorization URL.";
      }catch(e){if(linkState)linkState.textContent="Could not start linking. The secure game backend may not be available yet.";console.error(e);}finally{linkButton.disabled=false;}
    });
  }
}
