

const $ = s => document.querySelector(s), sleep = ms => new Promise(r => setTimeout(r, ms));
let unlocked = false, userName = '', stream = null, busy = false;
function toast(m) { const t = $('#toast'); t.querySelector('span').textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 3000) }

/* tabs */
function tab(w) {
    if (w === 'face' && !unlocked) { $('#tFace').classList.remove('shake'); void $('#tFace').offsetWidth; $('#tFace').classList.add('shake'); toast('Pehle email se account banayein'); return }
    $('#tabs').dataset.on = w; $('#tEmail').setAttribute('aria-selected', w === 'email'); $('#tFace').setAttribute('aria-selected', w === 'face');
    $('#pEmail').hidden = w !== 'email'; $('#pFace').hidden = w !== 'face';
}
$('#tEmail').onclick = () => tab('email'); $('#tFace').onclick = () => tab('face');

/* validation */
const rules = {
    name: v => v.trim().length < 3 ? 'Apna poora naam likhein (kam az kam 3 huroof).' : /\d/.test(v) ? 'Naam mein number nahi ho sakta.' : '',
    mail: v => {
        if (!v.trim()) return 'Email ka pata likhein.'; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Yeh email durust nahi lagta. Misal: naam@email.com';
        const t = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'yaho.com': 'yahoo.com', 'hotmial.com': 'hotmail.com' }[v.split('@')[1].toLowerCase()];
        return t ? `Kya aap ${t} kehna chahte hain?` : ''
    },
    pass: v => v.length < 8 ? 'Password kam az kam 8 huroof ka ho.' : !/[A-Za-z]/.test(v) || !/\d/.test(v) ? 'Password mein harf aur number dono hon.' : ''
};
const ids = { name: 'fName', mail: 'fMail', pass: 'fPass' };
function check(k, show = true) {
    const el = $('#' + k), f = $('#' + ids[k]), m = rules[k](el.value);
    if (show) { f.classList.toggle('bad', !!m); f.classList.toggle('good', !m && !!el.value); f.querySelector('.err').textContent = m }
    return !m;
}
Object.keys(rules).forEach(k => {
    const el = $('#' + k);
    el.addEventListener('blur', () => el.value && check(k));
    el.addEventListener('input', () => { if ($('#' + ids[k]).classList.contains('bad') || $('#' + ids[k]).classList.contains('good')) check(k) })
});
$('#pass').addEventListener('input', e => {
    const v = e.target.value; let s = 0; if (v.length >= 8) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) s++;
    if (!v) s = 0; $('#meter').dataset.s = s; $('#meter small').textContent = ['', 'Kamzor', 'Theek', 'Acha', 'Mazboot'][s]
});
$('#eye').onclick = () => { const p = $('#pass'), h = p.type === 'password'; p.type = h ? 'text' : 'password'; $('#eye use').setAttribute('href', h ? '#i-eyeoff' : '#i-eye'); $('#eye').setAttribute('aria-label', h ? 'Password chupayein' : 'Password dikhayein') };


$('#pEmail').addEventListener('submit', async e => {
    e.preventDefault();

    const bad = Object.keys(rules).filter(k => !check(k));

    if (bad.length) {
        $('#' + bad[0]).focus();
        return;
    }

    const b = $('#go');
    b.disabled = true;
    b.textContent = 'Account ban raha hai...';

    const fullName = $('#name').value.trim();
    const email = $('#mail').value.trim();
    const password = $('#pass').value;

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'customer'
                }
            }
        });

        if (error) {
            throw error;
        }

        toast('Account successfully register ho gaya! Email check karein.');

        b.textContent = 'Registered successfully';

        // Show login page after successful registration
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2500);

    } catch (error) {
        toast(error.message);
        b.disabled = false;
        b.textContent = 'Sign up';
    }
});

document.querySelectorAll('#lg,.lg2').forEach(a => a.onclick = e => { e.preventDefault(); toast('Login page jald shuru hoga') });

/* face */
const stage = $('#stage'), status = $('#fStatus'), dots = [...document.querySelectorAll('#steps b')];
const setP = p => $('.prog').style.strokeDashoffset = 628 * (1 - p);
function reset() {
    stage.className = 'stage'; setP(0); dots.forEach(d => d.className = ''); $('#tips').style.display = ''; $('#fTitle').textContent = 'Apna chehra frame ke darmiyan rakhein';
    status.textContent = 'Camera ki ijazat dein. Aapki tasveer sirf pehchaan ki tasdeeq ke liye istemal hogi.';
}
const SEQ = [['Seedha camera mein dekhein. Chehra frame ke andar rakhein.', 2000], ['Aahista se apna sar dayein taraf ghumayein.', 2200], ['Ab aahista se bayein taraf ghumayein.', 2200]];
async function sequence() {
    stage.classList.add('scan'); $('#tips').style.display = 'none';
    for (let i = 0; i < SEQ.length; i++) {
        dots.forEach((d, j) => d.className = j < i ? 'dn' : j === i ? 'on' : ''); status.textContent = SEQ[i][0];
        const steps = 10; for (let s = 1; s <= steps; s++) { await sleep(SEQ[i][1] / steps); setP((i + s / steps) / SEQ.length) }
    }
    dots.forEach(d => d.className = 'dn'); stage.classList.remove('scan', 'live', 'demo'); stage.classList.add('ok');
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
}
async function runDemo() {
    if (busy) return; busy = true; reset(); stage.classList.add('demo');
    const cap = ['1. Chehra frame ke andar laayein.', '2. Seedha dekhein, hilein nahi.', '3. Phir aahista dayein aur bayein ghoomein.'];
    for (let i = 0; i < 3; i++) { dots.forEach((d, j) => d.className = j < i ? 'dn' : j === i ? 'on' : ''); status.textContent = cap[i]; await sleep(2300) }
    reset(); status.textContent = 'Tayyar hain? "Chehra scan karein" dabayein.'; busy = false;
}
$('#demo').onclick = runDemo;
$('#scan').onclick = async () => {
    const b = $('#scan');
    if (b.dataset.done) { location.href = 'index.html'; return }
    if (busy) return; busy = true; reset(); b.classList.add('load'); status.textContent = 'Camera khul raha hai… ijazat dein.';
    let live = false;
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }); $('#vid').srcObject = stream; await $('#vid').play(); stage.classList.add('live'); live = true }
    catch (err) { stage.classList.add('demo'); toast('Camera ki ijazat nahi mili — demo scan chal raha hai') }
    b.classList.remove('load'); b.disabled = true; b.style.opacity = .6;
    await sequence();
    $('#fTitle').textContent = `Shabash${userName ? ' ' + userName : ''}! Chehra register ho gaya`;
    status.textContent = 'Ab aap sirf apna chehra dikha kar aasani se login kar sakte hain.';
    b.disabled = false; b.style.opacity = 1; b.textContent = 'Shuru karein'; b.dataset.done = 1; $('#demo').style.display = 'none'; busy = false;
};