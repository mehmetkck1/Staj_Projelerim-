/* Sade Film/Dizi Arşiv & İnceleme & Topluluk (localStorage demo) */

const STORE = {
  users: "sp_users",
  session: "sp_session",
  archive: "sp_archive",     // map: userId -> items[]
  posts: "sp_posts"          // global posts[]
};

function $(s){return document.querySelector(s)}
function $all(s){return Array.from(document.querySelectorAll(s))}
function read(key, fallback){
  try{ const raw = localStorage.getItem(key); return raw?JSON.parse(raw):fallback; }
  catch{ return fallback; }
}
function write(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function uid(prefix="id"){ return prefix + "_" + Math.random().toString(16).slice(2) + Date.now().toString(16); }
function nowISO(){ return new Date().toISOString(); }
function escapeHtml(s){
  s = String(s ?? "");
  return s.replace(/[&<>"']/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[ch]));
}
function timeAgo(iso){
  if(!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000);
  if(m<1) return "şimdi";
  if(m<60) return `${m} dk önce`;
  const h = Math.floor(m/60);
  if(h<24) return `${h} saat önce`;
  const d = Math.floor(h/24);
  if(d<7) return `${d} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR");
}

function toast(msg){
  let el = $("#toast");
  if(!el){
    el = document.createElement("div");
    el.id="toast";
    el.style.position="fixed";
    el.style.bottom="18px";
    el.style.left="50%";
    el.style.transform="translateX(-50%)";
    el.style.background="rgba(15,23,42,.92)";
    el.style.color="white";
    el.style.padding="10px 14px";
    el.style.borderRadius="999px";
    el.style.border="1px solid rgba(255,255,255,.12)";
    el.style.boxShadow="0 18px 50px rgba(2,6,23,.25)";
    el.style.zIndex="999";
    el.style.fontSize="13px";
    el.style.opacity="0";
    el.style.transition="opacity .16s ease, transform .16s ease";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity="1";
  el.style.transform="translateX(-50%) translateY(-2px)";
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(()=>{
    el.style.opacity="0";
    el.style.transform="translateX(-50%) translateY(6px)";
  }, 2200);
}

/* ---------- AUTH (demo) ---------- */
function getUsers(){ return read(STORE.users, []); }
function setUsers(u){ write(STORE.users, u); }
function getSession(){ return read(STORE.session, null); }
function setSession(s){ write(STORE.session, s); }
function me(){
  const ses = getSession();
  if(!ses?.userId) return null;
  return getUsers().find(u => u.id === ses.userId) || null;
}

function seed(){
  if(read("sp_seeded", false)) return;
  const users = getUsers();
  if(users.length===0){
    const u1 = { id: uid("u"), username:"mehmet", password:"1234", createdAt: nowISO() };
    const u2 = { id: uid("u"), username:"ayse", password:"1234", createdAt: nowISO() };
    setUsers([u1,u2]);

    // demo post
    const posts = [
      {
        id: uid("p"),
        userId: u2.id,
        title: "Interstellar",
        kind: "Film",
        year: 2014,
        rating: 9,
        text: "Müzikler + görseller mükemmel. Duygusu çok iyi.",
        image: null,
        createdAt: nowISO(),
        likes: [],
        comments: []
      }
    ];
    write(STORE.posts, posts);
  }
  write("sp_seeded", true);
}

function login(username, password){
  username = (username||"").trim().toLowerCase();
  const u = getUsers().find(x => x.username===username && x.password===(password||""));
  if(!u) return {ok:false, msg:"Kullanıcı adı veya şifre hatalı."};
  setSession({ userId:u.id, at: nowISO() });
  return {ok:true, msg:"Giriş başarılı."};
}
function register(username, password){
  username = (username||"").trim().toLowerCase();
  if(username.length<3) return {ok:false, msg:"Kullanıcı adı min 3 karakter."};
  if((password||"").length<4) return {ok:false, msg:"Şifre min 4 karakter."};
  const users = getUsers();
  if(users.some(x=>x.username===username)) return {ok:false, msg:"Bu kullanıcı adı alınmış."};
  const u = { id: uid("u"), username, password, createdAt: nowISO() };
  users.push(u); setUsers(users);
  setSession({ userId:u.id, at: nowISO() });
  return {ok:true, msg:"Kayıt tamam."};
}
function logout(){
  localStorage.removeItem(STORE.session);
}

/* ---------- DATA ---------- */
function archiveMap(){ return read(STORE.archive, {}); }
function setArchiveMap(m){ write(STORE.archive, m); }
function myArchive(){
  const u = me(); if(!u) return [];
  return archiveMap()[u.id] || [];
}
function setMyArchive(list){
  const u = me(); if(!u) return;
  const map = archiveMap();
  map[u.id] = list;
  setArchiveMap(map);
}

function posts(){ return read(STORE.posts, []); }
function setPosts(p){ write(STORE.posts, p); }

function usernameById(id){
  const u = getUsers().find(x=>x.id===id);
  return u ? u.username : "kullanıcı";
}

/* ---------- UI shell ---------- */
function setActiveNav(){
  const page = document.body.dataset.page || "";
  $all(".nav a[data-page]").forEach(a=>{
    a.classList.toggle("active", a.dataset.page===page);
  });
}

function mountHeader(){
  const u = me();
  const header = document.createElement("div");
  header.className="header";
  header.innerHTML = `
    <div class="header-inner">

      <div class="userbox" id="userbox">
        <div class="avatar" id="avatarBtn">👤</div>
        <div class="username">${u ? "@"+u.username : "Misafir"}</div>
        <div class="dd" id="dd">
          ${u ? `
            <a href="archive.html">📚 Arşivim</a>
            <a href="community.html">🌍 Topluluk</a>
            <div class="sep"></div>
            <button id="logoutBtn">🚪 Çıkış</button>
          ` : `
            <a href="index.html">🔐 Giriş / Kayıt</a>
          `}
        </div>
      </div>

      <a class="brand" href="index.html" aria-label="Ana sayfa">
        <div class="logo"></div>
        <div>
          <strong>Film/Dizi Arşiv</strong>
          <span>Sade • Basit • Sosyal</span>
        </div>
      </a>

      <div class="nav">
        <a href="index.html" data-page="home">🏠 Ana</a>
        <a href="archive.html" data-page="archive">📚 Arşivim</a>
        <a href="community.html" data-page="community">🌍 Topluluk</a>
      </div>

    </div>
  `;
  document.body.prepend(header);
  setActiveNav();

  const dd = $("#dd");
  $("#avatarBtn")?.addEventListener("click", (e)=>{
    e.stopPropagation();
    dd.style.display = (dd.style.display==="block") ? "none" : "block";
  });
  document.addEventListener("click", (e)=>{
    if(dd && dd.style.display==="block"){
      const box = $("#userbox");
      if(!box?.contains(e.target)) dd.style.display="none";
    }
  });
  $("#logoutBtn")?.addEventListener("click", ()=>{
    logout(); toast("Çıkış yapıldı.");
    setTimeout(()=>location.href="index.html", 250);
  });
}

function requireLogin(){
  if(!me()) location.href="index.html";
}

function requireLogin(){
  if(!me()) location.href="index.html";
}

/* ---------- Modal ---------- */
function mountModal(){
  if($("#modalBackdrop")) return;
  const back = document.createElement("div");
  back.className="modal-backdrop";
  back.id="modalBackdrop";
  back.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="head">
        <strong id="modalTitle">Detay</strong>
        <button class="close" id="modalClose">Kapat ✕</button>
      </div>
      <div class="body" id="modalBody"></div>
    </div>
  `;
  document.body.appendChild(back);
  $("#modalClose")?.addEventListener("click", closeModal);
  back.addEventListener("click", (e)=>{ if(e.target===back) closeModal(); });
}
function openModal(title, html){
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  $("#modalBackdrop").style.display="flex";
}
function closeModal(){ $("#modalBackdrop").style.display="none"; }

/* ---------- Pages ---------- */
function boot(){
  seed();
  mountModal();
  mountHeader();

  const page = document.body.dataset.page;
  if(page==="archive" || page==="community") requireLogin();

  if(page==="home") initHome();
  if(page==="archive") initArchive();
  if(page==="community") initCommunity();
}
document.addEventListener("DOMContentLoaded", boot);

/* HOME */
function initHome(){
  const u = me();
  const auth = $("#auth");
  const dash = $("#dash");

  if(u){
    auth.style.display="none";
    dash.style.display="block";
    $("#hello").textContent = "@"+u.username;

    const a = myArchive();
    const p = posts().filter(x=>x.userId===u.id);
    $("#kpiA").textContent = a.length;
    $("#kpiP").textContent = p.length;
    $("#kpiL").textContent = p.reduce((s,x)=>s+(x.likes?.length||0),0);

    renderPostList("#recentPosts", posts().slice().sort((x,y)=>(y.createdAt||"").localeCompare(x.createdAt||"")).slice(0,6));
  }else{
    auth.style.display="block";
    dash.style.display="none";
  }

  $("#loginBtn")?.addEventListener("click", ()=>{
    const res = login($("#lUser").value, $("#lPass").value);
    toast(res.msg);
    if(res.ok) setTimeout(()=>location.reload(), 250);
  });
  $("#regBtn")?.addEventListener("click", ()=>{
    const res = register($("#rUser").value, $("#rPass").value);
    toast(res.msg);
    if(res.ok) setTimeout(()=>location.reload(), 250);
  });
  $("#demoBtn")?.addEventListener("click", ()=>{
    const res = login("mehmet","1234");
    toast(res.msg);
    if(res.ok) setTimeout(()=>location.reload(), 250);
  });
}

/* ARCHIVE */
function initArchive(){
  const listEl = $("#archiveList");
  const qEl = $("#q");
  const kindEl = $("#kindFilter");

  function render(){
    const q = (qEl.value||"").trim().toLowerCase();
    const kind = kindEl.value;

    let items = myArchive()
      .filter(x => !q || (x.title||"").toLowerCase().includes(q))
      .filter(x => kind==="all" ? true : x.kind===kind);

    listEl.innerHTML = "";
    if(items.length===0){
      listEl.innerHTML = `<div class="notice"><strong>Arşivin boş.</strong> Aşağıdan ekle.</div>`;
      return;
    }

    items.forEach(it=>{
      const div = document.createElement("div");
      div.className="item";
      div.innerHTML = `
        <div class="meta">
          <strong>${escapeHtml(it.title)} <span class="pill">${escapeHtml(it.kind)} • ${it.year||"—"}</span></strong>
          <div class="muted">⭐ ${it.rating}/10 • ${it.text ? escapeHtml(it.text) : "Not yok"}</div>
          <div class="muted">Eklenme: ${timeAgo(it.createdAt)}</div>
        </div>
        <div class="actions">
          <button class="btn small primary" data-share="${it.id}">Paylaş</button>
          <button class="btn small" data-edit="${it.id}">Düzenle</button>
          <button class="btn small danger" data-del="${it.id}">Sil</button>
        </div>
      `;
      listEl.appendChild(div);
    });

    $all("[data-del]").forEach(b=>{
      b.addEventListener("click", ()=>{
        if(!confirm("Silinsin mi?")) return;
        const id = b.dataset.del;
        setMyArchive(myArchive().filter(x=>x.id!==id));
        toast("Silindi.");
        render();
      });
    });

    $all("[data-edit]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = b.dataset.edit;
        const item = myArchive().find(x=>x.id===id);
        if(!item) return;
        openEditModal(item, render);
      });
    });

    $all("[data-share]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = b.dataset.share;
        const item = myArchive().find(x=>x.id===id);
        if(!item) return;
        openShareModal(item);
      });
    });
  }

  $("#addBtn")?.addEventListener("click", ()=>{
    const title = $("#title").value.trim();
    const kind = $("#kind").value;
    const year = Number($("#year").value) || null;
    const rating = Number($("#rating").value);
    const text = $("#text").value.trim();

    if(!title) return toast("İsim gerekli.");
    if(!(rating>=1 && rating<=10)) return toast("Puan 1-10 arası olmalı.");

    const item = { id: uid("a"), title, kind, year, rating, text, createdAt: nowISO() };
    const list = myArchive();
    list.unshift(item);
    setMyArchive(list);

    $("#title").value=""; $("#year").value=""; $("#rating").value=""; $("#text").value="";
    toast("Arşive eklendi.");
    render();
  });

  qEl.addEventListener("input", render);
  kindEl.addEventListener("change", render);

  render();
}

function openEditModal(item, onDone){
  const html = `
    <div class="row">
      <div>
        <label class="pill">Ad</label>
        <input class="input" id="eTitle" value="${escapeHtml(item.title)}" />
      </div>
      <div>
        <label class="pill">Tür</label>
        <select class="select" id="eKind">
          <option ${item.kind==="Film"?"selected":""}>Film</option>
          <option ${item.kind==="Dizi"?"selected":""}>Dizi</option>
        </select>
      </div>
    </div>
    <div style="height:10px"></div>
    <div class="row">
      <div>
        <label class="pill">Yıl</label>
        <input class="input" id="eYear" type="number" value="${item.year||""}" />
      </div>
      <div>
        <label class="pill">Puan (1-10)</label>
        <input class="input" id="eRating" type="number" min="1" max="10" value="${item.rating}" />
      </div>
    </div>
    <div style="height:10px"></div>
    <label class="pill">Not/İnceleme</label>
    <textarea class="textarea" id="eText">${escapeHtml(item.text||"")}</textarea>
    <div style="height:12px"></div>
    <button class="btn primary" id="eSave">Kaydet</button>
  `;
  openModal("Düzenle", html);

  $("#eSave")?.addEventListener("click", ()=>{
    const title = $("#eTitle").value.trim();
    const kind = $("#eKind").value;
    const year = Number($("#eYear").value) || null;
    const rating = Number($("#eRating").value);
    const text = $("#eText").value.trim();

    if(!title) return toast("İsim gerekli.");
    if(!(rating>=1 && rating<=10)) return toast("Puan 1-10 arası olmalı.");

    const list = myArchive().map(x=>{
      if(x.id!==item.id) return x;
      return { ...x, title, kind, year, rating, text };
    });
    setMyArchive(list);
    toast("Güncellendi.");
    closeModal();
    onDone?.();
  });
}

/* SHARE (with optional image) */
function openShareModal(item){
  const html = `
    <div class="notice">
      <strong>${escapeHtml(item.title)}</strong> paylaşımı
      <div class="muted">Toplulukta inceleme olarak görünecek.</div>
    </div>

    <div style="height:12px"></div>

    <div class="row">
      <div>
        <label class="pill">Puan</label>
        <input class="input" id="sRating" type="number" min="1" max="10" value="${item.rating}" />
      </div>
      <div>
        <label class="pill">Fotoğraf (opsiyonel)</label>
        <input class="input" id="sImage" type="file" accept="image/*" />
      </div>
    </div>

    <div style="height:10px"></div>
    <label class="pill">İnceleme</label>
    <textarea class="textarea" id="sText">${escapeHtml(item.text||"")}</textarea>

    <div style="height:10px"></div>
    <img id="sPreview" class="thumb" style="display:none" />

    <div style="height:12px"></div>
    <button class="btn primary" id="sPost">Topluluğa Gönder</button>
  `;

  openModal("Topluluk Paylaş", html);

  let imageData = null;

  $("#sImage")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    if(f.size > 1.5 * 1024 * 1024){
      toast("Fotoğraf çok büyük (max ~1.5MB).");
      e.target.value = "";
      return;
    }
    imageData = await fileToDataURL(f);
    const img = $("#sPreview");
    img.src = imageData;
    img.style.display="block";
  });

  $("#sPost")?.addEventListener("click", ()=>{
    const u = me();
    const rating = Number($("#sRating").value);
    const text = $("#sText").value.trim();

    if(!(rating>=1 && rating<=10)) return toast("Puan 1-10 arası olmalı.");
    if(text.length < 3) return toast("İnceleme çok kısa.");

    const p = {
      id: uid("p"),
      userId: u.id,
      title: item.title,
      kind: item.kind,
      year: item.year,
      rating,
      text,
      image: imageData,
      createdAt: nowISO(),
      likes: [],
      comments: []
    };

    const all = posts();
    all.unshift(p);
    setPosts(all);

    toast("Paylaşıldı.");
    closeModal();
    // yönlendir
    setTimeout(()=>location.href="community.html", 250);
  });
}

function fileToDataURL(file){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=>resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* COMMUNITY */
function initCommunity(){
  const qEl = $("#cq");
  const kindEl = $("#ckind");
  const listEl = $("#postList");

  function render(){
    const q = (qEl.value||"").trim().toLowerCase();
    const kind = kindEl.value;

    let items = posts()
      .filter(p => !q || (p.title||"").toLowerCase().includes(q) || (p.text||"").toLowerCase().includes(q))
      .filter(p => kind==="all" ? true : p.kind===kind);

    listEl.innerHTML = "";
    if(items.length===0){
      listEl.innerHTML = `<div class="notice"><strong>Henüz paylaşım yok.</strong> Arşivinden paylaş.</div>`;
      return;
    }

    const u = me();

    items.forEach(p=>{
      const liked = (p.likes||[]).includes(u.id);
      const img = p.image ? `<img class="thumb" src="${p.image}" alt="görsel" />` : "";
      const div = document.createElement("div");
      div.className="item";
      div.innerHTML = `
        ${img}
        <div class="meta">
          <strong>@${escapeHtml(usernameById(p.userId))} • ${escapeHtml(p.title)}
            <span class="pill">${escapeHtml(p.kind)} • ${p.year||"—"}</span>
            <span class="pill good">⭐ ${p.rating}/10</span>
          </strong>
          <div class="muted">${escapeHtml(p.text||"")}</div>
          <div class="muted">${timeAgo(p.createdAt)}</div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn small ${liked?'ghost':''}" data-like="${p.id}">❤️ ${liked?'Beğendin':'Beğen'} (${(p.likes||[]).length})</button>
            <button class="btn small" data-cmt="${p.id}">💬 Yorum (${(p.comments||[]).length})</button>
          </div>
        </div>
      `;
      listEl.appendChild(div);
    });

    $all("[data-like]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = b.dataset.like;
        const all = posts();
        const p = all.find(x=>x.id===id);
        if(!p) return;
        p.likes = p.likes || [];
        const i = p.likes.indexOf(me().id);
        if(i>=0) p.likes.splice(i,1);
        else p.likes.push(me().id);
        setPosts(all);
        render();
      });
    });

    $all("[data-cmt]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = b.dataset.cmt;
        const p = posts().find(x=>x.id===id);
        if(!p) return;
        openComments(p, render);
      });
    });
  }

  qEl.addEventListener("input", render);
  kindEl.addEventListener("change", render);
  render();
}

function openComments(post, onRefresh){
  const comments = post.comments || [];
  const html = `
    <div class="notice">
      <strong>${escapeHtml(post.title)}</strong> • ⭐ ${post.rating}/10
      <div class="muted">Paylaşan: @${escapeHtml(usernameById(post.userId))}</div>
    </div>

    <div style="height:12px"></div>

    ${post.image ? `<img class="thumb" style="width:120px;height:120px" src="${post.image}" />` : ""}

    <div style="height:12px"></div>

    <div class="card" style="box-shadow:none;border-radius:16px;background:linear-gradient(180deg,#fff,#f7fbff)">
      <div class="muted">İnceleme</div>
      <div style="margin-top:6px">${escapeHtml(post.text||"")}</div>
    </div>

    <div style="height:12px"></div>

    <label class="pill">Yorum yaz</label>
    <textarea class="textarea" id="cText" placeholder="Yorum..."></textarea>
    <div style="height:10px"></div>
    <button class="btn primary" id="cSend">Gönder</button>

    <div style="height:14px"></div>
    <div class="list" id="cList"></div>
  `;
  openModal("Yorumlar", html);

  const list = $("#cList");
  if(comments.length===0){
    list.innerHTML = `<div class="notice"><strong>Henüz yorum yok.</strong></div>`;
  }else{
    list.innerHTML = "";
    comments.slice().reverse().forEach(c=>{
      const div = document.createElement("div");
      div.className="item";
      div.innerHTML = `
        <div class="meta">
          <strong>@${escapeHtml(usernameById(c.userId))}</strong>
          <div class="muted">${escapeHtml(c.text||"")}</div>
          <div class="muted">${timeAgo(c.createdAt)}</div>
        </div>
      `;
      list.appendChild(div);
    });
  }

  $("#cSend")?.addEventListener("click", ()=>{
    const text = ($("#cText").value||"").trim();
    if(text.length<2) return toast("Yorum çok kısa.");
    const all = posts();
    const p = all.find(x=>x.id===post.id);
    if(!p) return;
    p.comments = p.comments || [];
    p.comments.push({ id: uid("c"), userId: me().id, text, createdAt: nowISO() });
    setPosts(all);
    toast("Yorum eklendi.");
    closeModal();
    onRefresh?.();
  });
}

/* ---------- end ---------- */
