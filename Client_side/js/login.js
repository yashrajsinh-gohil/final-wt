// Externalized JS for Login Admin and Client page
// Moved from inline <script> in Login Admin and Client.html

// ---------- Simple localStorage user system ---------
const USERS_KEY = 'cts_users_v1';
const CURRENT_KEY = 'cts_current_user';

function getUsers(){
    try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch(e){ return []; }
}
function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

function showAlert(message, type='success'){
    const a = document.getElementById('alert');
    a.className = 'alert alert-' + type;
    a.textContent = message;
    a.classList.remove('d-none');
    setTimeout(()=> a.classList.add('d-none'), 4000);
}

function initDefaultAccounts(){
    const users = getUsers();
    // ensure default admin
    if(!users.some(u => u.email.toLowerCase() === 'admin@admin.com')){
        users.push({name:'Administrator', email:'admin@admin.com', password:'admin123', role:'admin'});
    }
    // demo client
    if(!users.some(u => u.email.toLowerCase() === 'client1@demo.com')){
        users.push({name:'Demo Client', email:'client1@demo.com', password:'password123', role:'client'});
    }
    saveUsers(users);
}

function fillDemo(email, password, role){
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
    const el = document.querySelector(`input[name=loginRole][value=${role}]`);
    if(el) el.checked = true;
}

function handleSignup(e){
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    if(!name || !email || !password) return showAlert('Please fill all fields','danger');
    const users = getUsers();
    if(users.some(u => u.email.toLowerCase() === email)) return showAlert('Email already exists', 'danger');
    users.push({name, email, password, role:'client'});
    saveUsers(users);
    showAlert('Account created — you can now sign in', 'success');
    // switch to login and prefill
    document.getElementById('showLoginBtn').click();
    document.getElementById('loginEmail').value = email;
}

function handleLogin(e){
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const selectedRole = (document.querySelector('input[name=loginRole]:checked') || {}).value;
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email && u.password === password);
    if(!user) return showAlert('Invalid email or password', 'danger');
    if(user.role !== selectedRole) return showAlert('Selected role does not match account role', 'danger');
    // save current user
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    // Redirect clients to the separate client dashboard page (file in ../Client_side/)
    if(user.role === 'client'){
        // path relative to this HTML file (located in HomePage/)
        window.location.href = '../Client_side/Client Dashboard.html';
        return;
    }
    // Redirect admins to the separate admin dashboard page (file in ../Admin_side/)
    if(user.role === 'admin'){
        // encode space in filename to be safe
        window.location.href = '../Admin_side/AdminDashboard%20.html';
        return;
    }
    // fallback: show in-page dashboard if role is unexpected
    showDashboardFor(user);
}

function showDashboardFor(user){
    document.getElementById('loginView').classList.add('d-none');
    document.getElementById('signupView').classList.add('d-none');
    document.getElementById('alert').classList.add('d-none');
    if(user.role === 'admin'){
        document.getElementById('adminPanel').classList.remove('d-none');
        document.getElementById('clientPanel').classList.add('d-none');
        document.getElementById('adminWelcome').textContent = `Hello ${user.name} (${user.email})`;
    } else {
        document.getElementById('clientPanel').classList.remove('d-none');
        document.getElementById('adminPanel').classList.add('d-none');
        document.getElementById('clientWelcome').textContent = `Hello ${user.name} — welcome to your client dashboard`;
    }
}

function logout(){
    localStorage.removeItem(CURRENT_KEY);
    // show login
    document.getElementById('loginView').classList.remove('d-none');
    document.getElementById('signupView').classList.add('d-none');
    document.getElementById('adminPanel').classList.add('d-none');
    document.getElementById('clientPanel').classList.add('d-none');
    showAlert('Logged out', 'info');
}

// Attach UI handlers (safe to run when this script is loaded at end of body)
document.addEventListener('DOMContentLoaded', function(){
    const showSignupBtn = document.getElementById('showSignupBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    if(showSignupBtn) showSignupBtn.addEventListener('click', ()=>{
        document.getElementById('signupView').classList.remove('d-none');
        document.getElementById('loginView').classList.add('d-none');
    });
    if(showLoginBtn) showLoginBtn.addEventListener('click', ()=>{
        document.getElementById('loginView').classList.remove('d-none');
        document.getElementById('signupView').classList.add('d-none');
    });

    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    if(signupForm) signupForm.addEventListener('submit', handleSignup);
    if(loginForm) loginForm.addEventListener('submit', handleLogin);

    // on load
    initDefaultAccounts();
    const current = localStorage.getItem(CURRENT_KEY);
    if(current){
        try{ showDashboardFor(JSON.parse(current)); }catch(e){ /* ignore */ }
    }
});
