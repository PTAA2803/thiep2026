'use strict';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const STORAGE_KEYS = { wishes:'yearend2027-wishes', attendance:'yearend2027-rsvp' };
const tempStore = {};
const safeRead = (key, fallback) => { try { const parsed=JSON.parse(localStorage.getItem(key)); return parsed ?? fallback; } catch { return key in tempStore ? tempStore[key] : fallback; } };
const safeWrite = (key, value) => { tempStore[key] = value; try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
let toastTimer;
function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('shown');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('shown'),3400);}
function makeCalendar(){
  const grid=$('#calendarGrid');const weekdays=['T2','T3','T4','T5','T6','T7','CN'];
  for(const day of weekdays){const el=document.createElement('div');el.className='weekday';el.textContent=day;grid.append(el);}
  const leading=(new Date(2027,0,1).getDay()+6)%7;
  for(let i=0;i<leading;i++){let blank=document.createElement('div');grid.append(blank);}
  for(let date=1;date<=31;date++){
    const el=document.createElement('div');el.className=`day${date===9?' event-day':''}`;el.textContent=date;
    if(date===9){el.setAttribute('aria-label','Ngày diễn ra tiệc: 9 tháng 1 năm 2027');el.title='Ngày tổ chức Year End Party';}
    grid.append(el);
  }
}
function updateCountdown(){
  // Time is explicitly set to Vietnam time (+07:00), independent of visitor timezone.
  const target=new Date('2027-01-09T18:30:00+07:00').getTime();
  let diff=Math.max(0,Math.floor((target-Date.now())/1000));
  const days=Math.floor(diff/86400);diff%=86400;
  const hours=Math.floor(diff/3600);diff%=3600;
  const minutes=Math.floor(diff/60);const seconds=diff%60;
  for (const [id,n] of [['days',days],['hours',hours],['minutes',minutes],['seconds',seconds]]) {
    const el=document.getElementById(id);if(el)el.textContent=String(n).padStart(2,'0');
  }
}
function createWishCard(name,message){
  const item=document.createElement('article');item.className='wish-item';
  const author=document.createElement('strong');author.textContent='🌼 '+name;
  const text=document.createElement('p');text.textContent=message;
  item.append(author,text);return item;
}
function renderWishes(){
  const list=$('#wishesList');list.replaceChildren();
  const wishes=safeRead(STORAGE_KEYS.wishes,[]);
  wishes.slice(-5).reverse().forEach(w=>list.append(createWishCard(w.name,w.message)));
}
function setupEvents(){
  $('#directionButton').addEventListener('click',()=>{
    // The original video leaves the venue/address blank; don't invent a destination.
    toast('Địa chỉ tổ chức chưa được cập nhật.');
  });
  $('#wishForm').addEventListener('submit',e=>{
    e.preventDefault();const name=$('#wishName').value.trim();const message=$('#wishMessage').value.trim();
    if(!name||!message){toast('Vui lòng nhập tên và lời chúc của bạn.');return;}
    const wishes=safeRead(STORAGE_KEYS.wishes,[]);wishes.push({name,message});
    safeWrite(STORAGE_KEYS.wishes,wishes.slice(-30));renderWishes();e.target.reset();
    toast('💛 Đã lưu lời chúc trên thiết bị này!');
  });
  $('#rsvpForm').addEventListener('submit',e=>{
    e.preventDefault();const name=$('#rsvpName').value.trim();const status=$('input[name="attendance"]:checked')?.value;
    if(!name||!status){toast('Vui lòng nhập tên và chọn trạng thái tham dự.');return;}
    safeWrite(STORAGE_KEYS.attendance,{name,status});
    toast(`💌 Đã lưu xác nhận: ${name} – ${status}.`);
  });
  const savedRSVP=safeRead(STORAGE_KEYS.attendance,null);
  if(savedRSVP){$('#rsvpName').value=savedRSVP.name;const input=$$('[name="attendance"]').find(x=>x.value===savedRSVP.status);if(input)input.checked=true;}

}
makeCalendar();updateCountdown();setInterval(updateCountdown,1000);renderWishes();setupEvents();
