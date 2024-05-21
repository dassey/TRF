// script.js
document.getElementById('travel-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    // Load PDF document
    const existingPdfBytes = await fetch('Blank.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    // Fill form fields with the input data
    form.getTextField('Traveler Name').setText(formData.get('travelerName'));
    form.getTextField('Employee #').setText(formData.get('employeeNumber'));
    form.getTextField('Traveler Phone Number').setText(formData.get('travelerPhone'));
    form.getTextField('Home MTC').setText(formData.get('homeMTC'));
    form.getTextField('Traveler Email').setText(formData.get('travelerEmail'));
    form.getTextField('Final Destination').setText(formData.get('finalDestination'));
    form.getTextField('Event Date Range').setText(formData.get('eventDateRange'));
    form.getTextField('Event Charge Number').setText(formData.get('eventChargeNumber'));
    form.getTextField('EAF UUID #').setText(formData.get('eafUUID'));
    form.getTextField('Other Attendees').setText(formData.get('otherAttendees'));
    form.getDropdown('Type of Transportation Request').select(formData.get('transportationType'));
    form.getTextField('Dpt Date').setText(formData.get('departureDate'));
    form.getTextField('DptAirport').setText(formData.get('departureAirport'));
    form.getTextField('DptTime').setText(formData.get('departureTime'));
    form.getTextField('Flights').setText(formData.get('departureFlight'));
    form.getTextField('ArrAirport').setText(formData.get('arrivalAirport'));
    form.getTextField('ArrTime').setText(formData.get('arrivalTime'));
    form.getTextField('Rtn Date').setText(formData.get('returnDate'));
    form.getTextField('RtnAirport').setText(formData.get('returnAirport'));
    form.getTextField('RtnTime').setText(formData.get('returnTime'));
    form.getTextField('Flights2').setText(formData.get('returnFlight'));
    form.getDropdown('Is Hotel Requested?').select(formData.get('hotelRequest'));
    form.getTextField('Check In').setText(formData.get('hotelCheckIn'));
    form.getTextField('Check Out').setText(formData.get('hotelCheckOut'));
    form.getTextField('Number of Passengers').setText(formData.get('passengers'));
    form.getTextField('Specific Requirements').setText(formData.get('specificRequirements'));
    form.getTextField('Car Pick Up').setText(formData.get('carPickUp'));
    form.getTextField('Car Drop Off').setText(formData.get('carDropOff'));
    form.getTextField('Additional Requests/Notes').setText(formData.get('additionalRequests'));
    form.getTextField('POV Cost').setText(formData.get('povCost'));
    form.getTextField('Dpt City').setText(formData.get('departureCity'));
    form.getTextField('Arr City').setText(formData.get('arrivalCity'));
    form.getTextField('One Way Mileage').setText(formData.get('oneWayMileage'));
    form.getTextField('Round Trip Mileage').setText(formData.get('roundTripMileage'));
    form.getTextField('Current Mileage Rate').setText(formData.get('currentMileageRate'));
    form.getTextField('Airfare Quote').setText(formData.get('airfareQuote'));

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
