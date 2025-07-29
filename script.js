/* script.js */

/* ---------- visibility helpers ---------- */
const setElementDisplay=(id,show)=>{const e=document.getElementById(id);if(e)e.style.display=show?'block':'none'};
const setFlexElementDisplay=(id,show)=>{const e=document.getElementById(id);if(e)e.style.display=show?'flex':'none'};
function updateInputGroupRowDisplay(){
  const show=document.getElementById('ETPContainer').style.display!=='none'||document.getElementById('B2BContainer').style.display!=='none';
  document.querySelector('.input-group-row').style.display=show?'flex':'none';
}

/* ---------- dynamic show/hide ---------- */
document.getElementById('ETP').addEventListener('change',function(){setFlexElementDisplay('ETPContainer',this.checked);updateInputGroupRowDisplay()});
document.getElementById('B2B').addEventListener('change',function(){setFlexElementDisplay('B2BContainer',this.checked);updateInputGroupRowDisplay()});
document.getElementById('AirReservation').addEventListener('change',function(){
  const show=this.checked;setElementDisplay('AirSection',show);
  const trip=document.querySelector('input[name="TripType"]:checked');
  setElementDisplay('AirReturn',show&&trip&&trip.value==='RoundTrip');
});
document.querySelectorAll('input[name="TripType"]').forEach(r=>r.addEventListener('change',function(){
  setElementDisplay('AirReturn',document.getElementById('AirReservation').checked&&this.value==='RoundTrip');
}));
document.getElementById('CarRental').addEventListener('change',function(){setElementDisplay('CarSection',this.checked)});
document.getElementById('HotelReservation').addEventListener('change',function(){setElementDisplay('HotelSection',this.checked)});

/* ---------- auto-populate helpers ---------- */
const addMinutes=(t,m)=>{if(!t)return'';const[h,min]=t.split(':').map(Number);const d=new Date();
  d.setHours(h,min+m,0,0);return`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};

document.getElementById('TravelStart').addEventListener('change',e=>{
  ['DepDate','HotelCheckIn','CarDate'].forEach(id=>document.getElementById(id).value=e.target.value);
});
document.getElementById('TravelEnd').addEventListener('change',e=>{
  ['RetDepDate','HotelCheckOut','CarDropDate'].forEach(id=>document.getElementById(id).value=e.target.value);
});
document.getElementById('DepArrLocation').addEventListener('input',e=>{
  const v=e.target.value.toUpperCase();e.target.value=v;['RetDepLocation','CarPickUp'].forEach(id=>document.getElementById(id).value=v);
});
document.getElementById('DepLocation').addEventListener('input',e=>{
  const v=e.target.value.toUpperCase();e.target.value=v;['RetArrLocation','CarDrop'].forEach(id=>document.getElementById(id).value=v);
});
document.getElementById('DepArrTime').addEventListener('input',e=>document.getElementById('CarPUTime').value=addMinutes(e.target.value,30));
document.getElementById('RetDepTime').addEventListener('input',e=>document.getElementById('CarDropTime').value=addMinutes(e.target.value,-120));

/* ---------- on load ---------- */
window.addEventListener('load',()=>{
  ['AirReservation','CarRental','HotelReservation','ETP','B2B'].forEach(id=>document.getElementById(id).dispatchEvent(new Event('change')));
  const trip=document.querySelector('input[name="TripType"]:checked');if(trip)trip.dispatchEvent(new Event('change'));
  ['travelerName','employeeNumber','travelerEmail','travelerPhone','homeMTC'].forEach(id=>document.getElementById(id).value=localStorage.getItem(id)||'');
  if(navigator.vibrate){
    document.querySelectorAll('.touch-target').forEach(l=>l.addEventListener('click',()=>navigator.vibrate(10)));
  }
});

/* ---------- FORM SUBMISSION & PDF GENERATION ---------- */
/* (unchanged; retains existing PDF-Lib logic) */
