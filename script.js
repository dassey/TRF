// script.js
document.getElementById('travelRequestForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    // Load PDF document
    const existingPdfBytes = await fetch('Blank.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    // Fill form fields with the input data
    form.getTextField('trav_name').setText(formData.get('travelerName'));
    form.getTextField('trav_emp_num').setText(formData.get('employeeNumber'));
    form.getTextField('trav_phone').setText(formData.get('travelerPhone'));
    form.getTextField('trav_mtc').setText(formData.get('homeMTC'));
    form.getTextField('trav_email').setText(formData.get('travelerEmail'));
    form.getTextField('event_destination').setText(formData.get('finalDestination'));
    form.getTextField('event_dates').setText(formData.get('eventDateRange'));
    form.getTextField('event_charge').setText(formData.get('eventChargeNumber'));
    form.getTextField('event_uid').setText(formData.get('eafUUID'));
    form.getTextField('event_other').setText(formData.get('otherAttendees'));
    form.getDropdown('Dropdown1').select(formData.get('transportationType'));
    form.getTextField('dpt_date').setText(formData.get('departureDate'));
    form.getTextField('dpt_air').setText(formData.get('departureAirport'));
    form.getTextField('dpt_time').setText(formData.get('departureTime'));
    form.getTextField('dpt_flights').setText(formData.get('departureFlight'));
    form.getTextField('dpt_air2').setText(formData.get('arrivalAirport'));
    form.getTextField('dpt_arr').setText(formData.get('arrivalTime'));
    form.getTextField('rtn_date').setText(formData.get('returnDate'));
    form.getTextField('rtn_air').setText(formData.get('returnAirport'));
    form.getTextField('rtn_time').setText(formData.get('returnTime'));
    form.getTextField('rtn_flights').setText(formData.get('returnFlight'));
    form.getTextField('hot_in').setText(formData.get('hotelCheckIn'));
    form.getTextField('hot_out').setText(formData.get('hotelCheckOut'));
    form.getTextField('rent_pass').setText(formData.get('passengers'));
    form.getTextField('rent_comments').setText(formData.get('specificRequirements'));
    form.getTextField('rent_pickup_day').setText(formData.get('carPickUp'));
    form.getTextField('rent_dropoff').setText(formData.get('carDropOff'));
    form.getTextField('general_comments').setText(formData.get('additionalRequests'));

    // Serialize the PDF document to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Trigger a download of the filled PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Filled_Travel_Request_Form.pdf';
    a.click();
});
