// Firebase config
var firebaseConfig = {
  apiKey: "AIzaSyBh58FvUbynyZ1o96gCKJfjSk_czch-41c",
  authDomain: "shop-a-rone.firebaseapp.com",
  projectId: "shop-a-rone",
  storageBucket: "shop-a-rone.firebasestorage.app",
  messagingSenderId: "774549121928",
  appId: "1:774549121928:web:fbe87fa1db8bd43f7e283d",
  measurementId: "G-ZJXCGVMC98"
};
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();
var currentUser = null;
var currentShopMode = 'self';

// Navigation helper
function goTo(id) {
  document.querySelectorAll('.screen').forEach(s=>s.style.display='none');
  // Route navigation based on shop mode
  if(id==='navigation-screen' && currentShopMode==='spark') {
    id = 'spark-screen';
    document.getElementById('sparkUser').textContent = currentUser ? currentUser.email : 'User';
    // Populate spark list
    var sparkList = document.getElementById('sparkList');
    sparkList.innerHTML = '';
    document.querySelectorAll('#shoppingList li').forEach(li=>{
      var item = document.createElement('li');
      item.textContent = li.textContent;
      sparkList.appendChild(item);
    });
  }
  var el = document.getElementById(id);
  if(el) el.style.display='block';
}

// Auth functions
function firebaseLogin() {
  var email = document.getElementById('loginEmail').value;
  var pass = document.getElementById('loginPassword').value;
  auth.signInWithEmailAndPassword(email, pass).catch(e=>alert(e.message));
}
function firebaseSignup() {
  var email = document.getElementById('signupEmail').value;
  var pass = document.getElementById('signupPassword').value;
  auth.createUserWithEmailAndPassword(email, pass).catch(e=>alert(e.message));
}
function firebaseLogout() {
  auth.signOut();
}
auth.onAuthStateChanged(function(user){
  if(user) {
    currentUser = user;
    document.getElementById('welcomeUser').textContent = 'Welcome, '+user.email+'!';
    goTo('home-screen');
    loadListNames(user.uid);
    loadCloudList(user.uid);
  } else {
    currentUser = null;
    goTo('login-screen');
  }
});

// Shop mode selection
function selectShopMode(mode) {
  currentShopMode = mode;
  var status = document.getElementById('modeStatus');
  status.textContent = mode==='self' ? 'Self-Shop mode selected' : 'Spark Shopper mode selected';
}

// Shopping list functions
function addItem() {
  var item = document.getElementById('itemInput').value.trim();
  if(item) {
    var li = document.createElement('li');
    li.textContent = item;
    document.getElementById('shoppingList').appendChild(li);
    document.getElementById('itemInput').value='';
    saveList();
  }
}
function mockVoice() {
  var li = document.createElement('li');
  li.textContent = 'Apples (Voice)';
  document.getElementById('shoppingList').appendChild(li);
  saveList();
}
function saveList() {
  if(!currentUser) return;
  var items = Array.from(document.querySelectorAll('#shoppingList li')).map(li=>li.textContent);
  db.collection('lists').doc(currentUser.uid).set({ items: items });
}
function loadCloudList(uid) {
  db.collection('lists').doc(uid).get().then(doc=>{
    if(doc.exists) {
      var ul = document.getElementById('shoppingList');
      ul.innerHTML = '';
      doc.data().items.forEach(i=>{
        var li = document.createElement('li');
        li.textContent = i;
        ul.appendChild(li);
      });
    }
  });
}

// Price Checker
function checkPrice() {
  var product = document.getElementById('priceInput').value.trim();
  var results = document.getElementById('priceResults');
  if(product) {
    results.innerHTML = '<p><strong>'+product+'</strong></p>'
      +'<p>Walmart: $4.49</p>'
      +'<p>Target: $4.99</p>'
      +'<p>Kroger: $4.79</p>';
  }
}

// Checkout
function completeCheckout() {
  var count = document.querySelectorAll('#shoppingList li').length;
  document.getElementById('checkoutCount').textContent = count;
  var total = (count * 4.49).toFixed(2);
  document.getElementById('checkoutTotal').textContent = total;
  alert('Payment processed: $'+ total);
}

// Initialize on load
goTo('login-screen');


// Multi-list functions
function loadListNames(uid) {
  var select = document.getElementById('listSelect');
  select.innerHTML = ''; 
  var col = db.collection('users').doc(uid).collection('lists');
  col.get().then(snapshot => {
    if (snapshot.empty) {
      col.doc('Default').set({items: []}).then(() => loadListNames(uid));
      return;
    }
    snapshot.forEach(doc => {
      var option = document.createElement('option');
      option.value = doc.id;
      option.textContent = doc.id;
      select.appendChild(option);
    });
  });
}

function addPriceItem() {
  var product = document.getElementById('priceInput').value.trim();
  if (!product) return;
  // Add to list
  var li = document.createElement('li');
  li.textContent = product;
  document.getElementById('shoppingList').appendChild(li);
  saveList();
}

// Override saveList/loadCloudList for multi-lists
var originalSaveList = saveList;
function saveList() {
  if (!currentUser) return;
  var listName = document.getElementById('listSelect').value || 'Default';
  var items = Array.from(document.querySelectorAll('#shoppingList li')).map(li => li.textContent);
  db.collection('users').doc(currentUser.uid).collection('lists').doc(listName).set({items: items});
}

var originalLoadCloudList = loadCloudList;
function loadCloudList(uid) {
  var listName = document.getElementById('listSelect').value || 'Default';
  db.collection('users').doc(uid).collection('lists').doc(listName).get().then(doc => {
    if (doc.exists) {
      var listElement = document.getElementById('shoppingList');
      listElement.innerHTML = '';
      (doc.data().items || []).forEach(item => {
        var li = document.createElement('li');
        li.textContent = item;
        listElement.appendChild(li);
      });
    }
  });
}


// —— LIST MANAGEMENT FUNCTIONS —— 
function loadListNames(uid) {
  const select = document.getElementById('listSelect');
  select.innerHTML = '';
  const lists = db.collection('users').doc(uid).collection('lists');
  lists.get().then(snap => {
    if (snap.empty) {
      lists.doc('Default').set({ items: [] }).then(() => loadListNames(uid));
      return;
    }
    snap.forEach(doc => {
      let opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = doc.id;
      select.appendChild(opt);
    });
    switchList();
  });
}

function createNewList() {
  const name = document.getElementById('listNameInput').value.trim();
  if (!name) return alert('Please enter a list name.');
  const uid = currentUser.uid;
  const listRef = db.collection('users').doc(uid).collection('lists').doc(name);
  listRef.set({ items: [] }).then(() => {
    document.getElementById('listNameInput').value = '';
    loadListNames(uid);
    // After loading list names, select the new list and load it
    setTimeout(() => {
      const select = document.getElementById('listSelect');
      select.value = name;
      switchList();
    }, 500);
  });
}

function switchList() {
  if (currentUser) loadCloudList(currentUser.uid);
}
function deleteCurrentList() {
  const name = document.getElementById('listSelect').value;
  if (!confirm(`Delete list “${name}”?`)) return;
  const uid = currentUser.uid;
  db.collection('users').doc(uid).collection('lists').doc(name)
    .delete().then(() => loadListNames(uid));
}
// Override saveList & loadCloudList:
function saveList() {
  if (!currentUser) return;
  const name = document.getElementById('listSelect').value;
  const items = Array.from(document.querySelectorAll('#shoppingList li span.text'))
    .map(s => s.textContent);
  db.collection('users').doc(currentUser.uid)
    .collection('lists').doc(name).set({ items });
}
function loadCloudList(uid) {
  const name = document.getElementById('listSelect').value;
  const docRef = db.collection('users').doc(uid).collection('lists').doc(name);
  docRef.get().then(doc => {
    const ul = document.getElementById('shoppingList');
    ul.innerHTML = '';
    if (!doc.exists) return;
    doc.data().items.forEach(text => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.className = 'text'; span.textContent = text;
      li.appendChild(span);
      const btn = document.createElement('button');
      btn.textContent = '×'; btn.className = 'delete-btn';
      btn.onclick = () => { li.remove(); saveList(); };
      li.appendChild(btn);
      ul.appendChild(li);
    });
  });
}

// Enhance addItem() and mockVoice() to include delete-btn
addItem = (function(orig) {
  return function() {
    orig();
    // ensure span.text and delete button
    const li = document.getElementById('shoppingList').lastElementChild;
    if (li) {
      const span = document.createElement('span');
      span.className = 'text';
      span.textContent = li.textContent;
      li.textContent = '';
      li.appendChild(span);
      const btn = document.createElement('button');
      btn.textContent = '×'; btn.className = 'delete-btn';
      btn.onclick = () => { li.remove(); saveList(); };
      li.appendChild(btn);
      saveList();
    }
  };
})(addItem);

mockVoice = (function(orig) {
  return function() {
    orig();
    const li = document.getElementById('shoppingList').lastElementChild;
    if (li) {
      const span = document.createElement('span');
      span.className = 'text';
      span.textContent = li.textContent;
      li.textContent = '';
      li.appendChild(span);
      const btn = document.createElement('button');
      btn.textContent = '×'; btn.className = 'delete-btn';
      btn.onclick = () => { li.remove(); saveList(); };
      li.appendChild(btn);
      saveList();
    }
  };
})(mockVoice);

// Call loadListNames on auth state change
auth.onAuthStateChanged(user => {
  if (user) loadListNames(user.uid);
});


// Simplified list management
var currentListName = localStorage.getItem('currentList') || 'Default';

function createNewList() {
  var name = document.getElementById('listNameInput').value.trim();
  if (!name) return alert('Please enter a list name.');
  currentListName = name;
  localStorage.setItem('currentList', name);
  // Create empty list in Firestore
  db.collection('users').doc(currentUser.uid).collection('lists').doc(name)
    .set({ items: [] }).then(loadList);
}

function deleteCurrentList() {
  if (!currentListName) return;
  if (!confirm('Delete list "' + currentListName + '"?')) return;
  // Delete list document
  db.collection('users').doc(currentUser.uid).collection('lists').doc(currentListName)
    .delete().then(function() {
      currentListName = 'Default';
      localStorage.setItem('currentList', currentListName);
      loadList();
    });
}

function loadList() {
  // Load items for currentListName
  var ref = db.collection('users').doc(currentUser.uid).collection('lists').doc(currentListName);
  ref.get().then(function(doc) {
    var ul = document.getElementById('shoppingList');
    ul.innerHTML = '';
    if (doc.exists) {
      doc.data().items.forEach(function(text) {
        addListItem(text);
      });
    }
  });
}

// Helper to add <li> with delete button
function addListItem(text) {
  var li = document.createElement('li');
  var span = document.createElement('span');
  span.textContent = text;
  li.appendChild(span);
  var btn = document.createElement('button');
  btn.textContent = '×';
  btn.className = 'delete-btn';
  btn.onclick = function() {
    li.remove();
    saveList();
  };
  li.appendChild(btn);
  document.getElementById('shoppingList').appendChild(li);
}

function saveList() {
  var items = Array.from(document.querySelectorAll('#shoppingList li span'))
    .map(function(s) { return s.textContent; });
  db.collection('users').doc(currentUser.uid).collection('lists')
    .doc(currentListName).set({ items: items });
}

// Override addItem and mockVoice to use addListItem
function addItem() {
  var item = document.getElementById('itemInput').value.trim();
  if (!item) return;
  addListItem(item);
  document.getElementById('itemInput').value = '';
  saveList();
}
function mockVoice() {
  addListItem('Apples (Voice)');
  saveList();
}

// On auth change, load current list
auth.onAuthStateChanged(function(user) {
  if (user) {
    loadList();
  }
});
