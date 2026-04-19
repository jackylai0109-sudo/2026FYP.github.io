const firebaseConfig = {
  apiKey: "AIzaSyBhvbTPl-hGv1MWtrua55LuvIUpdabqy4M",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "project-221c4",
  storageBucket: "project-221c4.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

let map;

async function initMap() {
  try {
    await google.maps.importLibrary("maps");
    
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    const paris = { lat: 48.8566, lng: 2.3522 };
    
    const mapElement = document.getElementById("google-map");
    if (!mapElement) {
      console.error("找不到地圖容器元素");
      return;
    }

    map = new Map(mapElement, {
      center: paris,
      zoom: 12,
      mapId: "DEMO_MAP_ID",
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true,
      zoomControl: true,
    });
    window.map = map;
    
    const members = [
      { position: { lat: 48.8584, lng: 2.2945 }, name: "Alice", initial: "A" },
      { position: { lat: 48.8606, lng: 2.3376 }, name: "John", initial: "J" },
      { position: { lat: 48.8462, lng: 2.3464 }, name: "Mia", initial: "M" },
      { position: { lat: 48.8738, lng: 2.2950 }, name: "You", initial: "U" },
    ];
    
    members.forEach(member => {
      const markerContent = document.createElement("div");
      markerContent.innerHTML = `
        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#2CC5C2,#0C344E); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); cursor:pointer;">
          ${member.initial}
        </div>
      `;
      
      if (AdvancedMarkerElement) {
        new AdvancedMarkerElement({
          map: map,
          position: member.position,
          content: markerContent,
          title: member.name,
        });
      } else {
        new google.maps.Marker({
          map: map,
          position: member.position,
          title: member.name,
          icon: {
            url: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44"><circle cx="22" cy="22" r="20" fill="%232CC5C2" stroke="white" stroke-width="3"/><text x="22" y="28" font-size="16" text-anchor="middle" fill="white" font-weight="bold">${member.initial}</text></svg>`,
            scaledSize: new google.maps.Size(44, 44)
          }
        });
      }
    });
    
    console.log("地圖初始化成功");
  } catch (error) {
    console.error("地圖初始化失敗:", error);
    const mapElement = document.getElementById("google-map");
    if (mapElement) {
      mapElement.innerHTML = `<div style="padding:20px; text-align:center; color:red;">地圖載入失敗：${error.message}</div>`;
    }
  }
}

window.initMap = initMap;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}

auth.onAuthStateChanged(async (user) => {
  await updateUserButton(user);
  await updateProfileTabButton(user);
});

async function getUserDisplayName(user) {
  if (!user) return null;
  
  if (user.displayName) {
    return user.displayName;
  }
  
  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.username) {
        return userData.username;
      }
    }
  } catch (error) {
    console.error('獲取用戶名稱錯誤:', error);
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return '用戶';
}

async function updateUserButton(user) {
  const authButton = document.getElementById('authButton');
  const logoutButton = document.getElementById('logoutButton');
  
  if (!authButton || !logoutButton) return;
  
  if (user) {
    const displayName = await getUserDisplayName(user);
    const shortName = displayName.length > 8 ? displayName.substring(0, 8) + '…' : displayName;
    
    authButton.textContent = `👤 ${shortName}`;
    authButton.onclick = () => window.location.href = 'profile.html';
    logoutButton.style.display = 'inline-block';
    
    console.log('用戶已登入:', user.uid, '名稱:', displayName);
  } else {
    authButton.textContent = '註冊 / 登入';
    authButton.onclick = () => window.location.href = 'loginPage.html';
    logoutButton.style.display = 'none';
    
    console.log('用戶未登入');
  }
}

function updateProfileTabButton(user) {
  const profileTabBtn = document.getElementById('profileTabBtn');
  
  if (!profileTabBtn) return;
  
  if (user) {
    profileTabBtn.innerHTML = '✏️ 編輯資料';
  } else {
    profileTabBtn.innerHTML = '👤 帳號';
  }
}

function handleProfileTabClick() {
  console.log('點擊底部帳號按鈕');
  const user = auth.currentUser;
  
  if (user) {
    window.location.href = 'editProfile.html';
  } else {
    window.location.href = 'loginPage.html';
  }
}

function handleAuthAction() {
  const user = auth.currentUser;
  if (user) {
    window.location.href = 'profile.html';
  } else {
    window.location.href = 'loginPage.html';
  }
}

function showLogoutConfirm() {
  if (document.querySelector('.logout-confirm-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'logout-confirm-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'logout-confirm-dialog';

  dialog.innerHTML = `
    <div class="logout-icon">👋</div>
    <h3>準備離開？</h3>
    <p>登出後將無法接收即時訊息<br>確定要登出嗎？</p>
    <div class="logout-button-group">
      <button class="logout-btn cancel" id="cancelLogout">
        ✕ 取消
      </button>
      <button class="logout-btn confirm" id="confirmLogout">
        ✓ 確認登出
      </button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const cancelBtn = document.getElementById('cancelLogout');
  cancelBtn.addEventListener('click', () => {
    overlay.style.animation = 'fadeIn 0.2s ease reverse';
    dialog.style.animation = 'slideUp 0.2s ease reverse';
    
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 200);
  });

  const confirmBtn = document.getElementById('confirmLogout');
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.classList.add('loading');
    confirmBtn.textContent = '';
    cancelBtn.disabled = true;
    
    try {
      await auth.signOut();
      
      dialog.innerHTML = `
        <div class="logout-icon" style="animation: none;">✅</div>
        <h3>登出成功！</h3>
        <p>感謝您的使用，期待再相見</p>
      `;
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      
    } catch (error) {
      console.error('登出錯誤:', error);
      
      confirmBtn.classList.remove('loading');
      confirmBtn.innerHTML = '✓ 確認登出';
      cancelBtn.disabled = false;
      
      alert('登出失敗：' + error.message);
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      dialog.style.animation = 'slideUp 0.2s ease reverse';
      
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 200);
    }
  });

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      dialog.style.animation = 'slideUp 0.2s ease reverse';
      
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 200);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function hideAllOverlays() {
  const createJoin = document.getElementById('createJoin');
  const groupScreen = document.getElementById('groupScreen');
  const auth = document.getElementById('auth');
  
  if (createJoin) createJoin.style.display = 'none';
  if (groupScreen) groupScreen.style.display = 'none';
  if (auth) auth.style.display = 'none';
}

function showScreen(name) {
  if (!name) {
    hideAllOverlays();
    return;
  }
  hideAllOverlays();
  
  if (name === 'createJoin') {
    const createJoin = document.getElementById('createJoin');
    if (createJoin) createJoin.style.display = 'block';
  }
  else if (name === 'group') {
    const groupScreen = document.getElementById('groupScreen');
    if (groupScreen) groupScreen.style.display = 'block';
  }
  else if (name === 'auth') {
    const auth = document.getElementById('auth');
    if (auth) auth.style.display = 'block';
  }
  else if (name === 'map') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  else if (name === 'nearby' || name === 'itinerary') {
    alert(name + ' 功能示意 (原型)');
  }
}

function hideCreateJoin() { 
  const createJoin = document.getElementById('createJoin');
  if (createJoin) createJoin.style.display = 'none'; 
}

function hideGroup() { 
  const groupScreen = document.getElementById('groupScreen');
  if (groupScreen) groupScreen.style.display = 'none'; 
}

function hideAuth() { 
  const auth = document.getElementById('auth');
  if (auth) auth.style.display = 'none'; 
}