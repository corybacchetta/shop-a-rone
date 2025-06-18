function goTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screen + '-screen').classList.remove('hidden');
}
function login() {
  // placeholder
  goTo('home');
}
function signup() {
  // placeholder
  goTo('home');
}
function logout() {
  goTo('welcome');
}
console.log('Navigation loaded');


// ---- Shopping List Management ----
let lists = {};           // { listName: [ items ] }
let currentList = null;

function refreshListSelect() {
  const sel = document.getElementById('lists-select');
  sel.innerHTML = '';
  for (let name in lists) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.append(opt);
  }
  if (currentList && lists[currentList]) {
    sel.value = currentList;
  }
}

function switchList() {
  currentList = document.getElementById('lists-select').value;
  renderItems();
}

function createList() {
  const name = document.getElementById('new-list-name').value.trim();
  if (!name) return alert('Enter a list name.');
  if (lists[name]) return alert('A list with that name already exists.');
  lists[name] = [];
  currentList = name;
  document.getElementById('new-list-name').value = '';
  refreshListSelect();
  renderItems();
}

function deleteList() {
  if (!currentList) return;
  if (!confirm(`Delete "${currentList}"?`)) return;
  delete lists[currentList];
  currentList = Object.keys(lists)[0] || null;
  refreshListSelect();
  renderItems();
}

function addItem() {
  if (!currentList) return alert('Create or select a list first.');
  const item = document.getElementById('item-input').value.trim();
  if (!item) return;
  lists[currentList].push(item);
  document.getElementById('item-input').value = '';
  renderItems();
}

function deleteItem(idx) {
  lists[currentList].splice(idx, 1);
  renderItems();
}

function renderItems() {
  const ul = document.getElementById('items-ul');
  ul.innerHTML = '';
  if (!currentList) return;
  lists[currentList].forEach((itm, i) => {
    const li = document.createElement('li');
    li.textContent = itm;
    const btn = document.createElement('button');
    btn.textContent = '✕';
    btn.onclick = () => deleteItem(i);
    btn.className = 'del-btn';
    li.append(btn);
    ul.append(li);
  });
}

// Initialize a default list on page load
window.addEventListener('DOMContentLoaded', () => {
  lists = { 'My List': [] };
  currentList = 'My List';
  refreshListSelect();
  renderItems();
});


// Price Checker logic
function checkPrice() {
  const prod = document.getElementById('price-input').value.trim();
  const res = document.getElementById('price-results');
  if(!prod) return res.textContent='Enter a product.';
  const prices = { 'Milk':{'Walmart':3.49,'Target':3.79,'Kroger':3.59} };
  const data = prices[prod] || {'Walmart':(2+Math.random()*3).toFixed(2),'Target':(2+Math.random()*3).toFixed(2),'Kroger':(2+Math.random()*3).toFixed(2)};
  let html=''; for(let s in data) html+=`<p><strong>${s}:</strong> $${data[s]}</p>`;
  res.innerHTML=html;
}
