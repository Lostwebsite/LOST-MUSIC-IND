import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,RecaptchaVerifier,signInWithPhoneNumber,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,runTransaction,collection,query,where,orderBy,limit,getDocs,addDoc,onSnapshot,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const A=window.LostApp||{toast(){},closeSheetUI(){},openSheet(){},cur(){},clean:x=>x,play(){}},CFG=window.FIREBASE_CONFIG||{};
const ON=!!CFG.apiKey&&!/PASTE/i.test(CFG.apiKey);
const $=s=>document.querySelector(s);
const LSg=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},LSs=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const h=(t,p={},...k)=>{const e=document.createElement(t);for(const[a,v]of Object.entries(p)){if(a==="class")e.className=v;else if(a==="text")e.textContent=v;else if(a.startsWith("on"))e[a]=v;else e.setAttribute(a,v)}k.flat().forEach(c=>{if(c!=null&&c!=="")e.append(c.nodeType?c:document.createTextNode(c))});return e};
const er=e=>({"auth/invalid-credential":"Wrong email or password","auth/email-already-in-use":"That email already has an account","auth/weak-password":"Password needs 6 or more characters","auth/invalid-email":"That email doesn't look right","auth/invalid-phone-number":"Check the phone number (use +91…)","auth/invalid-verification-code":"Wrong code","auth/too-many-requests":"Too many tries, wait a little","permission-denied":"Not allowed. Check the Firestore rules"}[e.code]||e.message||"Something went wrong");
const cleanUn=v=>{v=(v||"").trim();return /^[A-Za-z0-9_.]{3,20}$/.test(v)?v:null};

const css=document.createElement("style");css.textContent=`#soc{z-index:48}.chat{display:flex;flex-direction:column;height:calc(100vh - 190px)}.msgs{flex:1;overflow-y:auto;padding:8px 0}.bub{max-width:78%;padding:10px 14px;border-radius:20px;margin:6px 0;font-size:15px;line-height:1.4;animation:up .4s both;word-break:break-word}.bub.me{margin-left:auto;background:rgba(255,255,255,.2);border-bottom-right-radius:6px}.bub.th{background:var(--g);border:1px solid var(--line);border-bottom-left-radius:6px}.sc{display:flex;gap:10px;align-items:center;cursor:pointer}.sc img{width:46px;height:46px;border-radius:12px;object-fit:cover}.sc b{font:400 14px/1.25 Outfit;display:block}.sc small{display:block;color:var(--dim);font-size:11px}.cbar{display:flex;gap:8px;align-items:center;padding-top:8px}.fld{margin:10px 0}.chk{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--dim);line-height:1.5;margin:12px 0}.chk input{margin-top:4px}`;document.head.appendChild(css);

const closeBtn=h("button",{class:"ib",id:"socClose","aria-label":"Close",onclick:()=>A.closeSheetUI()});closeBtn.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';
const sheet=h("div",{class:"sheet",id:"soc"},h("div",{class:"npw",style:"text-align:left"},h("div",{class:"nph"},closeBtn,h("div",{id:"socT",text:"FRIENDS"}),h("span",{style:"width:42px"})),h("div",{class:"sg",id:"socTabs",style:"margin-top:14px"}),h("div",{id:"socBody"})));
document.body.appendChild(sheet);

let app,auth,db,user=null,prof=null,tab="chats",unsub=null,amode="in",conf=null;
const row=(t,s,f)=>h("div",{class:"row",onclick:f},h("div",{class:"ib",style:"width:46px;height:46px;flex:none;font:600 18px Outfit",text:(t[0]||"?").toUpperCase()}),h("div",{style:"min-width:0"},h("b",{text:t}),h("small",{text:s})));
const note=t=>h("p",{class:"msg",style:"text-align:left;padding:14px 0",text:t});

function render(){const b=$("#socBody"),tabs=$("#socTabs");if(unsub){unsub();unsub=null}b.innerHTML="";tabs.innerHTML="";$("#socT").textContent="FRIENDS";
 if(!ON){b.append(note("Accounts are not set up yet. Add your Firebase settings in firebase-config.js (steps are in the README)."));return}
 if(!user)return authView(b);
 if(!prof)return profileView(b);
 [["chats","Chats"],["find","Find"],["me","Me"]].forEach(([k,n])=>tabs.append(h("button",{class:tab===k?"on":"",text:n,onclick:()=>{tab=k;render()}})));
 ({chats:chatsView,find:findView,me:meView})[tab](b)}

async function claim(u,un,name){const low=un.toLowerCase();
 await runTransaction(db,async tx=>{const r=doc(db,"usernames",low);if((await tx.get(r)).exists())throw new Error("taken");
  tx.set(r,{uid:u.uid});tx.set(doc(db,"users",u.uid),{username:un,usernameLower:low,createdAt:serverTimestamp()});
  tx.set(doc(db,"private",u.uid),{name:name||"",email:u.email||"",phone:u.phoneNumber||"",consent:true,createdAt:serverTimestamp()},{merge:true})});
 prof={username:un,usernameLower:low};render()}

function authView(b){const t=$("#socTabs");[["in","Sign in"],["up","Create account"],["ph","Phone OTP"]].forEach(([k,n])=>t.append(h("button",{class:amode===k?"on":"",text:n,onclick:()=>{amode=k;conf=null;render()}})));
 b.append(note("Signing in is optional. You only need an account to find friends and chat. Your name and email or phone stay private; friends only see your username."));
 if(amode==="ph")return phoneView(b);
 const em=h("input",{class:"tx",type:"email",placeholder:"Email",autocomplete:"email"}),pw=h("input",{class:"tx",type:"password",placeholder:"Password (6 or more characters)",autocomplete:amode==="up"?"new-password":"current-password"});
 b.append(h("div",{class:"fld"},em),h("div",{class:"fld"},pw));
 let un,nm,ck;
 if(amode==="up"){un=h("input",{class:"tx",placeholder:"Choose a username (letters, numbers, _ .)",autocapitalize:"none"});nm=h("input",{class:"tx",placeholder:"Your name (optional)"});ck=h("input",{type:"checkbox"});
  b.append(h("div",{class:"fld"},un),h("div",{class:"fld"},nm),h("label",{class:"chk"},ck,"I agree that Lost stores my name and email to run my account. Only my username is visible to others."))}
 b.append(h("button",{class:"btn",text:amode==="up"?"Create account":"Sign in",onclick:async()=>{try{
   if(amode==="up"){if(!ck.checked)return A.toast("Please tick the agreement");const u=cleanUn(un.value);if(!u)return A.toast("Username: 3-20 letters, numbers, _ or .");
    const c=await createUserWithEmailAndPassword(auth,em.value.trim(),pw.value);try{await claim(c.user,u,nm.value.trim())}catch(e){A.toast(e.message==="taken"?"That username is taken, choose another":"Couldn't save the username")}}
   else await signInWithEmailAndPassword(auth,em.value.trim(),pw.value)}catch(e){A.toast(er(e))}}}));
 if(amode==="in")b.append(h("button",{class:"pill",style:"display:block;margin:8px auto",text:"Forgot password",onclick:async()=>{if(!em.value)return A.toast("Type your email first");try{await sendPasswordResetEmail(auth,em.value.trim());A.toast("Reset link sent")}catch(e){A.toast(er(e))}}}))}

function phoneView(b){const ph=h("input",{class:"tx",type:"tel",placeholder:"Phone with country code, e.g. +91XXXXXXXXXX"}),cd=h("input",{class:"tx",inputmode:"numeric",placeholder:"6-digit code",style:"display:none"}),ck=h("input",{type:"checkbox"});
 b.append(h("div",{class:"fld"},ph),h("div",{class:"fld"},cd),h("label",{class:"chk"},ck,"I agree that Lost stores my phone number to run my account. Only my username is visible to others."),h("div",{id:"recap"}));
 const go=h("button",{class:"btn",text:"Send OTP",onclick:async()=>{try{
  if(!conf){if(!ck.checked)return A.toast("Please tick the agreement");window._rv=window._rv||new RecaptchaVerifier(auth,"recap",{size:"invisible"});conf=await signInWithPhoneNumber(auth,ph.value.trim(),window._rv);cd.style.display="block";go.textContent="Verify code";A.toast("OTP sent")}
  else{await conf.confirm(cd.value.trim());conf=null}}catch(e){A.toast(er(e));try{if(window._rv)window._rv.clear()}catch(x){}window._rv=null;conf=null;go.textContent="Send OTP"}}});b.append(go)}

function profileView(b){const un=h("input",{class:"tx",placeholder:"Choose a username (letters, numbers, _ .)",autocapitalize:"none"}),nm=h("input",{class:"tx",placeholder:"Your name (optional)"}),ck=h("input",{type:"checkbox"});
 b.append(note("One last step: pick a username. Friends find you by it, and it is the only thing they see."),h("div",{class:"fld"},un),h("div",{class:"fld"},nm),h("label",{class:"chk"},ck,"I agree that Lost stores my name and contact (email or phone) to run my account."),
  h("button",{class:"btn",text:"Save",onclick:async()=>{if(!ck.checked)return A.toast("Please tick the agreement");const u=cleanUn(un.value);if(!u)return A.toast("Username: 3-20 letters, numbers, _ or .");try{await claim(user,u,nm.value.trim())}catch(e){A.toast(e.message==="taken"?"That username is taken":er(e))}}}),
  h("button",{class:"pill",style:"display:block;margin:8px auto",text:"Sign out",onclick:()=>signOut(auth)}))}

function findView(b){const q=h("input",{class:"tx",placeholder:"Search a username",autocapitalize:"none"}),res=h("div",{class:"list"});b.append(h("div",{class:"fld"},q),res);let tm;
 q.oninput=()=>{clearTimeout(tm);tm=setTimeout(async()=>{const v=q.value.trim().toLowerCase();res.innerHTML="";if(v.length<2)return;
  try{const s=await getDocs(query(collection(db,"users"),where("usernameLower",">=",v),where("usernameLower","<=",v+"\uf8ff"),limit(12)));let n=0;
   s.forEach(d=>{if(d.id===user.uid)return;n++;const u=d.data();res.append(row(u.username,"Tap to chat",()=>openChat(d.id,u.username)))});
   if(!n)res.append(h("p",{class:"msg",text:"No one found with that username"}))}catch(e){A.toast(er(e))}},300)}}

async function chatsView(b){const l=h("div",{class:"list"});b.append(l);l.append(h("p",{class:"msg",text:"Loading…"}));
 try{const s=await getDocs(query(collection(db,"chats"),where("members","array-contains",user.uid)));const a=[];s.forEach(d=>a.push(d.data()));
  a.sort((x,y)=>((y.updatedAt&&y.updatedAt.seconds)||0)-((x.updatedAt&&x.updatedAt.seconds)||0));l.innerHTML="";const bl=LSg("un_blocks",[]);let n=0;
  a.forEach(c=>{const o=c.members.find(m=>m!==user.uid);if(bl.includes(o))return;n++;const nm=(c.names&&c.names[o])||"Friend";l.append(row(nm,c.last||"",()=>openChat(o,nm)))});
  if(!n)l.append(h("p",{class:"msg",text:"No chats yet. Use Find to search a friend's username."}))}catch(e){l.innerHTML="";A.toast(er(e))}}

function meView(b){b.append(note("Signed in as @"+prof.username+". Your name and contact stay private; others see only your username."),h("button",{class:"btn",text:"Sign out",onclick:()=>signOut(auth)}))}

function openChat(o,name){if(unsub){unsub();unsub=null}const b=$("#socBody");$("#socTabs").innerHTML="";b.innerHTML="";$("#socT").textContent=name.toUpperCase();
 const id=[user.uid,o].sort().join("_"),msgs=h("div",{class:"msgs"}),inp=h("input",{class:"tx",placeholder:"Message",enterkeyhint:"send"});
 const send=async(text,song)=>{try{await setDoc(doc(db,"chats",id),{members:[user.uid,o],names:{[user.uid]:prof.username,[o]:name},last:song?"♪ "+song.title:text,updatedAt:serverTimestamp()},{merge:true});
  await addDoc(collection(db,"chats",id,"messages"),{from:user.uid,text:text||"",song:song||null,ts:serverTimestamp()})}catch(e){A.toast(er(e))}};
 const doSend=()=>{const t=inp.value.trim();if(!t)return;inp.value="";send(t,null)};
 inp.onkeydown=e=>{if(e.key==="Enter")doSend()};
 b.append(h("div",{class:"acts",style:"justify-content:flex-start;margin:6px 0"},
   h("button",{class:"pill",text:"← Chats",onclick:()=>{tab="chats";render()}}),
   h("button",{class:"pill",text:"Block",onclick:()=>{const bl=LSg("un_blocks",[]);bl.push(o);LSs("un_blocks",bl);A.toast("Blocked");tab="chats";render()}}),
   h("button",{class:"pill",text:"Report",onclick:async()=>{try{await addDoc(collection(db,"reports"),{by:user.uid,about:o,chat:id,ts:serverTimestamp()});A.toast("Reported, thank you")}catch(e){A.toast(er(e))}}})),
  h("div",{class:"chat"},msgs,h("div",{class:"cbar"},
   h("button",{class:"ib",text:"♪",title:"Send the song that is playing",onclick:()=>{const s=A.cur();if(!s)return A.toast("Play a song first");if(s.loc)return A.toast("Songs from your phone can't be shared");send("",{id:s.id,title:A.clean(s.title),ch:s.ch,img:s.img,src:s.src||null})}}),
   inp,h("button",{class:"ib",text:"➤",onclick:doSend}))));
 if(LSg("un_blocks",[]).includes(o)){msgs.append(h("p",{class:"msg",text:"You blocked this person."}));return}
 unsub=onSnapshot(query(collection(db,"chats",id,"messages"),orderBy("ts","asc"),limit(150)),s=>{msgs.innerHTML="";
  s.forEach(d=>{const m=d.data(),el=h("div",{class:"bub "+(m.from===user.uid?"me":"th")});
   if(m.song){const so=m.song;el.append(h("div",{class:"sc",onclick:()=>A.play([so],0)},h("img",{src:so.img||"icon-512.png",alt:""}),h("div",{},h("b",{text:so.title}),h("small",{text:so.ch+" · tap to play"}))))}
   if(m.text)el.append(m.text);msgs.append(el)});msgs.scrollTop=msgs.scrollHeight},e=>A.toast(er(e)))}

function openSoc(t){tab=t||"chats";render();A.openSheet("soc")}
const lb=$("#newPl");if(lb)lb.after(h("button",{class:"btn",text:"Friends & chat",onclick:()=>openSoc("chats")}));
const sn=$("#srcNote");if(sn)sn.after(h("button",{class:"pill",style:"margin:10px 0",text:"Find friends",onclick:()=>openSoc("find")}));
if(ON){app=initializeApp(CFG);auth=getAuth(app);db=getFirestore(app);
 onAuthStateChanged(auth,async u=>{user=u;prof=null;if(u){try{const d=await getDoc(doc(db,"users",u.uid));prof=d.exists()?d.data():null}catch(e){}}render()})}
render();
