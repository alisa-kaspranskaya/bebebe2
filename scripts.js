// ПАРОЛЬ


const SITE_PASSWORD = "12345";

const loginScreen = document.getElementById('loginScreen');
const siteContent = document.getElementById('siteContent');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const logoutBtn = document.getElementById('logoutBtn');

if(sessionStorage.getItem('siteUnlocked') === 'true'){
  showSite();
} else {
  showLogin();
}

function showLogin(){
  loginScreen.style.display = 'flex';
  siteContent.style.display = 'none';
}

function showSite(){
  loginScreen.style.display = 'none';
  siteContent.style.display = 'block';
}

function checkPassword(){
  if(passwordInput.value === SITE_PASSWORD){
    sessionStorage.setItem('siteUnlocked', 'true');
    showSite();
  } else {
    errorMsg.textContent = "Неверный пароль";
  }
}

loginBtn?.addEventListener('click', checkPassword);

passwordInput?.addEventListener('keydown', function(e){
  if(e.key === 'Enter'){
    checkPassword();
  }
});


//СОХРАНЕНИЕ НОВОЙ ЗАПИСИ


(function(){

  function $(sel){ return document.querySelector(sel); }
  function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
  function escapeHtml(s){
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  }

  const menu = $('#menu');
  const mySidenav = $('#mySidenav');
  const closeSidenav = $('#closeSidenav') || $('#mySidenav .closebtn');
  const sideNavLinks = $('#sideNavLinks');
  const mainNav = document.querySelector('nav.navigation');
  const addEntry = $('#addEntry');
  const addPanel = $('#addPanel');
  const newTitle = $('#newTitle');
  const newText = $('#newText');
  const boldBtn = $('#boldBtn');
  const italicBtn = $('#italicBtn');
  const h1Btn = $('#h1Btn');
  const h2Btn = $('#h2Btn');
  const saveBtn = $('#saveBtn');
  const cancelBtn = $('#cancelBtn');
  const newSectionsContainer = $('#newSections');

  const STORAGE_KEY = 'mySiteEntries';

  let editingId = null;

  function openNav(){
    mySidenav?.classList.add('open');
    document.body.classList.add('sidenav-open');
  }
  function closeNav(){
    mySidenav?.classList.remove('open');
    document.body.classList.remove('sidenav-open');
  }
  menu?.addEventListener('click', openNav);
  closeSidenav?.addEventListener('click', closeNav);
  sideNavLinks?.addEventListener('click', function(e){
    if(e.target && e.target.matches('a')) closeNav();
  });

  function getEntries(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){
      console.error('Ошибка чтения localStorage', e);
      return [];
    }
  }
  function setEntries(entries){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch(e){
      console.error('Ошибка записи localStorage', e);
    }
  }

  function renderEntry(entry){
    const sec = document.createElement('section');
    sec.id = 'entry-' + entry.id;
    sec.dataset.entryId = entry.id.toString();
    sec.className = 'user-entry';

    sec.innerHTML = `
      <div class="entry-header" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <h1 class="page-title" style="margin:0;">${escapeHtml(entry.title)}</h1>
        <div class="entry-controls" style="display:flex;gap:8px;">
          <button class="edit-entry btn-ghost" data-entry-id="${entry.id}" title="Редактировать">✎</button>
          <button class="delete-entry btn-ghost" data-entry-id="${entry.id}" title="Удалить">🗑</button>
        </div>
      </div>
      <div class="user-content">${entry.content}</div>
    `;

    if(newSectionsContainer){
      newSectionsContainer.appendChild(sec);
    } else {
      const main = document.querySelector('main');
      main && main.appendChild(sec);
    }

    if(mainNav){
      const link = document.createElement('a');
      link.href = '#' + sec.id;
      link.textContent = entry.title;
      link.dataset.entryId = entry.id;
      mainNav.appendChild(link);
      sideNavLinks && sideNavLinks.appendChild(link.cloneNode(true));
    }
  }

  function removeEntryFromDOM(id){
    const sec = document.querySelector(`section[data-entry-id="${id}"]`);
    sec && sec.remove();
    if(mainNav){
      const links = mainNav.querySelectorAll(`a[data-entry-id="${id}"]`);
      links.forEach(a => a.remove());
    }
    if(sideNavLinks){
      const links = sideNavLinks.querySelectorAll(`a[data-entry-id="${id}"]`);
      links.forEach(a => a.remove());
    }
  }

  function updateEntryInDOM(entry){
    const sec = document.querySelector(`section[data-entry-id="${entry.id}"]`);
    if(sec){
      const titleEl = sec.querySelector('.page-title');
      if(titleEl) titleEl.textContent = entry.title;
      const contentEl = sec.querySelector('.user-content');
      if(contentEl) contentEl.innerHTML = entry.content;
    }
    if(mainNav){
      mainNav.querySelectorAll(`a[data-entry-id="${entry.id}"]`).forEach(a => a.textContent = entry.title);
    }
    if(sideNavLinks){
      sideNavLinks.querySelectorAll(`a[data-entry-id="${entry.id}"]`).forEach(a => a.textContent = entry.title);
    }
  }

  function loadSavedEntries(){
    const entries = getEntries();
    entries.forEach(entry => renderEntry(entry));
  }

  function addNewEntry(title, content){
    const entries = getEntries();
    const id = Date.now();
    const entry = { id, title, content };
    entries.push(entry);
    setEntries(entries);
    renderEntry(entry);
  }

  function saveEditedEntry(id, title, content){
    const entries = getEntries();
    const idx = entries.findIndex(e => e.id === id);
    if(idx === -1) return;
    entries[idx].title = title;
    entries[idx].content = content;
    setEntries(entries);
    updateEntryInDOM(entries[idx]);
  }

  function deleteEntry(id){
    let entries = getEntries();
    entries = entries.filter(e => e.id !== id);
    setEntries(entries);
    removeEntryFromDOM(id);
  }

  function syncSideNav(){
    if(!mainNav || !sideNavLinks) return;
    sideNavLinks.innerHTML = '';
    mainNav.querySelectorAll('a').forEach(a => {
      const clone = a.cloneNode(true);
      if(a.dataset && a.dataset.entryId) clone.dataset.entryId = a.dataset.entryId;
      sideNavLinks.appendChild(clone);
    });
  }

  syncSideNav();
  loadSavedEntries();

  addEntry?.addEventListener('click', (e)=>{
    e.preventDefault();
    editingId = null; // новая запись
    if(addPanel){
      addPanel.style.display = 'block';
      addPanel.setAttribute('aria-hidden','false');
    }
    if(newTitle) { newTitle.value = ''; newTitle.focus(); }
    if(newText) newText.innerHTML = '';
    if(saveBtn) saveBtn.textContent = 'Сохранить';
  });

  cancelBtn?.addEventListener('click', ()=>{
    if(addPanel){
      addPanel.style.display = 'none';
      addPanel.setAttribute('aria-hidden','true');
    }
    editingId = null;
    if(newTitle) newTitle.value = '';
    if(newText) newText.innerHTML = '';
  });

  boldBtn?.addEventListener('click', ()=> document.execCommand('bold'));
  italicBtn?.addEventListener('click', ()=> document.execCommand('italic'));
  h1Btn?.addEventListener('click', ()=> document.execCommand('formatBlock', false, 'H1'));
  h2Btn?.addEventListener('click', ()=> document.execCommand('formatBlock', false, 'H2'));

  saveBtn?.addEventListener('click', ()=>{
    const title = (newTitle && newTitle.value) ? newTitle.value.trim() : '';
    const contentHTML = (newText && newText.innerHTML) ? newText.innerHTML.trim() : '';

    if(!title){
      alert('Введите заголовок раздела');
      newTitle && newTitle.focus();
      return;
    }
    if(!contentHTML){
      alert('Введите текст раздела');
      newText && newText.focus();
      return;
    }

    if(editingId){
      saveEditedEntry(editingId, title, contentHTML);
    } else {
      addNewEntry(title, contentHTML);
    }

    if(addPanel){
      addPanel.style.display = 'none';
      addPanel.setAttribute('aria-hidden','true');
    }
    editingId = null;
    if(newTitle) newTitle.value = '';
    if(newText) newText.innerHTML = '';
  });

  (newSectionsContainer || document).addEventListener('click', function(e){
    const editBtn = e.target.closest && e.target.closest('.edit-entry');
    const delBtn = e.target.closest && e.target.closest('.delete-entry');

    if(editBtn){
      const id = Number(editBtn.dataset.entryId);
      const entries = getEntries();
      const entry = entries.find(x => x.id === id);
      if(!entry) return;
      editingId = id;
      if(addPanel){
        addPanel.style.display = 'block';
        addPanel.setAttribute('aria-hidden','false');
      }
      if(newTitle) newTitle.value = entry.title;
      if(newText) newText.innerHTML = entry.content;
      if(saveBtn) saveBtn.textContent = 'Сохранить изменения';
      newTitle && newTitle.focus();
      return;
    }

    if(delBtn){
      const id = Number(delBtn.dataset.entryId);
      if(!confirm('Удалить эту запись?')) return;
      deleteEntry(id);
      return;
    }
  });
})();
