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
document.getElementById('travelRequestForm').addEventListener('submit',async function(event){
    event.preventDefault();
    const formData=new FormData(event.target);
    const {PDFDocument}=PDFLib;

    /* ------- field-name map (maps form ID to PDF field name) ------- */
    const pdfFieldNames={
        homeMTC:'Dropdown46',travelerName:'Name',employeeNumber:'Employee#',travelerPhone:'Phone',travelerEmail:'Email',
        trainingLocation:'Training Location',uid:'UID',travelStart:'Travel Start',travelEnd:'Travel End',
        airReservationCheck:'Air Reservation',hotelReservationCheck:'Hotel Reservation',carRentalCheck:'Car Rental',
        povCheck:'POV',etpCheck:'ETP',b2bCheck:'B2B',
        roundTripCheck:'Round Trip',oneWayCheck:'One Way',
        depAirline:'Dep Airline',depFlight:'Dep flight',depLocation:'Dep location',depArrLocation:'Dep arr location',
        depDate:'Dep Date',depTime:'Dep Time',depArrTime:'Dep arr time',airNotes:'Air notes',
        retAirline:'Ret airline',retFlight:'Ret flight',retDepLocation:'Ret dep location',retArrLocation:'Ret arr location',
        retDepDate:'Ret dep date',retDepTime:'Ret dep time',retArrTime:'Ret arr time',
        oneWayCarCheck:'One way',carPickUp:'Car pick up',carDate:'car date',carPUTime:'car p/u time',
        carDrop:'car drop',carDropDate:'car drop date',carDropTime:'car drop time',carNotes:'car notes',
        travelerBookedHotel:'Dropdown41',hotelCheckIn:'Hotel check in',hotelCheckOut:'Hotel check out',
        reservNumber:'reserv #',hotelLocation:'Hotel location',hotelNotes:'Hotel Notes',
        etpDropdown:'ETP Drop down',b2bUID:'B2B UID',comments:'Comments'
    };

    /* ------- persist traveller basics ------- */
    ['travelerName','employeeNumber','travelerEmail','travelerPhone','homeMTC']
      .forEach(k=>localStorage.setItem(k,formData.get(k)||''));

    try{
        const existingPdfBytes=await fetch('MyFile.pdf').then(r=>{
            if(!r.ok)throw new Error(`Failed to fetch MyFile.pdf: ${r.statusText}`);return r.arrayBuffer();
        });
        const pdfDoc=await PDFDocument.load(existingPdfBytes);const form=pdfDoc.getForm();

        const setText=(f,v)=>{try{if(f)form.getTextField(f).setText(v||'');}catch(e){console.warn('field',f,e);}};
        const setDropdown=(f,v)=>{try{if(f&&v)form.getDropdown(f).select(v);}catch(e){console.warn('dropdown',f,e);}};
        const setCheckbox=(f,c)=>{try{if(!f)return;const cb=form.getCheckBox(f);c?cb.check():cb.uncheck();}catch(e){console.warn('checkbox',f,e);}};
        const setRadio=(g,v)=>{try{
          const rF=pdfFieldNames.roundTripCheck,oF=pdfFieldNames.oneWayCheck;
          if(v==='RoundTrip'){if(rF)form.getCheckBox(rF).check();if(oF)form.getCheckBox(oF).uncheck();}
          else if(v==='OneWay'){if(oF)form.getCheckBox(oF).check();if(rF)form.getCheckBox(rF).uncheck();}
          else{if(rF)form.getCheckBox(rF).uncheck();if(oF)form.getCheckBox(oF).uncheck();}
        }catch(e){console.warn('radio',g,e);}};

        /* ------- fill traveller info ------- */
        setDropdown(pdfFieldNames.homeMTC,formData.get('homeMTC'));
        setText(pdfFieldNames.travelerName,formData.get('travelerName'));
        setText(pdfFieldNames.employeeNumber,formData.get('employeeNumber'));
        setText(pdfFieldNames.travelerPhone,formData.get('travelerPhone'));
        setText(pdfFieldNames.travelerEmail,formData.get('travelerEmail'));

        /* event summary */
        setText(pdfFieldNames.trainingLocation,formData.get('TrainingLocation'));
        setText(pdfFieldNames.uid,formData.get('UID'));
        setText(pdfFieldNames.travelStart,formData.get('TravelStart'));
        setText(pdfFieldNames.travelEnd,formData.get('TravelEnd'));

        /* requirements */
        setCheckbox(pdfFieldNames.airReservationCheck,document.getElementById('AirReservation').checked);
        setCheckbox(pdfFieldNames.hotelReservationCheck,document.getElementById('HotelReservation').checked);
        setCheckbox(pdfFieldNames.carRentalCheck,document.getElementById('CarRental').checked);
        setCheckbox(pdfFieldNames.povCheck,document.getElementById('POV').checked);
        setCheckbox(pdfFieldNames.etpCheck,document.getElementById('ETP').checked);
        setCheckbox(pdfFieldNames.b2bCheck,document.getElementById('B2B').checked);

        /* air section */
        if(document.getElementById('AirReservation').checked){
            const tripVal=formData.get('TripType');setRadio('TripType',tripVal);
            setText(pdfFieldNames.depAirline,formData.get('DepAirline'));
            setText(pdfFieldNames.depFlight,formData.get('DepFlight'));
            setText(pdfFieldNames.depLocation,formData.get('DepLocation'));
            setText(pdfFieldNames.depArrLocation,formData.get('DepArrLocation'));
            setText(pdfFieldNames.depDate,formData.get('DepDate'));
            setText(pdfFieldNames.depTime,formData.get('DepTime'));
            setText(pdfFieldNames.depArrTime,formData.get('DepArrTime'));
            setText(pdfFieldNames.airNotes,formData.get('AirNotes'));
            if(tripVal==='RoundTrip'){
                setText(pdfFieldNames.retAirline,formData.get('RetAirline'));
                setText(pdfFieldNames.retFlight,formData.get('RetFlight'));
                setText(pdfFieldNames.retDepLocation,formData.get('RetDepLocation'));
                setText(pdfFieldNames.retArrLocation,formData.get('RetArrLocation'));
                setText(pdfFieldNames.retDepDate,formData.get('RetDepDate'));
                setText(pdfFieldNames.retDepTime,formData.get('RetDepTime'));
                setText(pdfFieldNames.retArrTime,formData.get('RetArrTime'));
            }
        }

        /* car section */
        if(document.getElementById('CarRental').checked){
            setCheckbox(pdfFieldNames.oneWayCarCheck,document.getElementById('OneWayCar').checked);
            setText(pdfFieldNames.carPickUp,formData.get('CarPickUp'));
            setText(pdfFieldNames.carDate,formData.get('CarDate'));
            setText(pdfFieldNames.carPUTime,formData.get('CarPUTime'));
            setText(pdfFieldNames.carDrop,formData.get('CarDrop'));
            setText(pdfFieldNames.carDropDate,formData.get('CarDropDate'));
            setText(pdfFieldNames.carDropTime,formData.get('CarDropTime'));
            setText(pdfFieldNames.carNotes,formData.get('CarNotes'));
        }

        /* hotel section */
        if(document.getElementById('HotelReservation').checked){
            setDropdown(pdfFieldNames.travelerBookedHotel,formData.get('TravelerBookedHotel'));
            setText(pdfFieldNames.hotelCheckIn,formData.get('HotelCheckIn'));
            setText(pdfFieldNames.hotelCheckOut,formData.get('HotelCheckOut'));
            setText(pdfFieldNames.reservNumber,formData.get('ReservNumber'));
            setText(pdfFieldNames.hotelLocation,formData.get('HotelLocation'));
            setText(pdfFieldNames.hotelNotes,formData.get('HotelNotes'));
        }

        /* etp / b2b */
        if(document.getElementById('ETP').checked){setDropdown(pdfFieldNames.etpDropdown,formData.get('ETPDropdown'));}
        if(document.getElementById('B2B').checked){setText(pdfFieldNames.b2bUID,formData.get('B2BUID'));}

        /* comments */
        setText(pdfFieldNames.comments,formData.get('Comments'));

        form.updateFieldAppearances();

        /* filename */
        const uid=formData.get('UID')?.trim().replace(/[^a-zA-Z0-9_-]/g,'')||'NO_UID';
        const travelerName=formData.get('travelerName')?.trim()||'NO_NAME';
        const travelStart=formData.get('TravelStart')||'';
        let lastNameFirstInitial='UNKNOWN';
        if(travelerName.includes(' ')){const p=travelerName.split(' ').filter(s=>s);
          lastNameFirstInitial=`${p[p.length-1].toUpperCase()}${p[0][0].toUpperCase()}`;}
        else if(travelerName)lastNameFirstInitial=travelerName.toUpperCase();
        let formattedDate='NO_DATE';
        if(travelStart){
          try{const [y,m,d]=travelStart.split('-');
            const dt=new Date(Date.UTC(y,m-1,d));
            formattedDate=`${String(dt.getUTCDate()).padStart(2,'0')}_${dt.toLocaleString('en-US',{month:'short',timeZone:'UTC'}).toUpperCase()}_${String(dt.getUTCFullYear()).slice(-2)}`;
          }catch(e){formattedDate=travelStart.replace(/-/g,'_');}
        }
        const fileName=`${uid}_HST_${lastNameFirstInitial}_${formattedDate}.pdf`;

        const pdfBytes=await pdfDoc.save();
        const blob=new Blob([pdfBytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);
        const a=document.createElement('a');a.href=url;a.download=fileName;document.body.appendChild(a);a.click();
        document.body.removeChild(a);URL.revokeObjectURL(url);
    }catch(err){console.error('PDF error:',err);alert(`Error: ${err.message}`);}
});
