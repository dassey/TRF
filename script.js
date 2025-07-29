// Script.js
// Utility to show/hide element by ID
    const setElementDisplay = (id, show) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = show ? 'block' : 'none'; // Use 'block' for conditional sections
        }
    };

     // Utility to show/hide flex element by ID
    const setFlexElementDisplay = (id, show) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = show ? 'flex' : 'none'; // Use 'flex' for flex containers
        }
    };

    // Update ETP/B2B Row visibility
    function updateInputGroupRowDisplay() {
        const etpContainer = document.getElementById('ETPContainer');
        const b2bContainer = document.getElementById('B2BContainer');
        const inputGroupRow = document.querySelector('.input-group-row');
        const showRow = (etpContainer.style.display !== 'none' || b2bContainer.style.display !== 'none');
        inputGroupRow.style.display = showRow ? 'flex' : 'none';
    }

    // --- Event Listeners for Conditional Display ---

    // ETP Checkbox
    document.getElementById('ETP').addEventListener('change', function() {
        setFlexElementDisplay('ETPContainer', this.checked);
        updateInputGroupRowDisplay();
    });

    // B2B Checkbox
    document.getElementById('B2B').addEventListener('change', function() {
        setFlexElementDisplay('B2BContainer', this.checked);
        updateInputGroupRowDisplay();
    });

    // Air Reservation Checkbox
    document.getElementById('AirReservation').addEventListener('change', function() {
        const show = this.checked;
        setElementDisplay('AirSection', show);
        // Also trigger display update for round/one way inside air section
        const tripType = document.querySelector('input[name="TripType"]:checked');
        if (tripType) {
            setElementDisplay('AirReturn', show && tripType.value === 'RoundTrip');
        } else {
             setElementDisplay('AirReturn', false); // Hide if no trip type selected (shouldn't happen with radio)
        }
    });

    // Trip Type Radio Buttons (within Air Section)
    document.querySelectorAll('input[name="TripType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Only show return section if AirReservation is checked AND RoundTrip is selected
            const airChecked = document.getElementById('AirReservation').checked;
            setElementDisplay('AirReturn', airChecked && this.value === 'RoundTrip');
        });
    });


    // Car Rental Checkbox
    document.getElementById('CarRental').addEventListener('change', function() {
        setElementDisplay('CarSection', this.checked);
    });

    // Hotel Reservation Checkbox
    document.getElementById('HotelReservation').addEventListener('change', function() {
        setElementDisplay('HotelSection', this.checked);
    });


    // --- Event Listeners for Auto-populating Fields ---

    // Travel Start Date affects DepDate, HotelCheckIn, CarDate
    document.getElementById('TravelStart').addEventListener('change', function() {
        const travelStartDate = this.value;
        document.getElementById('DepDate').value = travelStartDate;
        document.getElementById('HotelCheckIn').value = travelStartDate;
        document.getElementById('CarDate').value = travelStartDate;
    });

    // Travel End Date affects RetDepDate, HotelCheckOut, CarDropDate
    document.getElementById('TravelEnd').addEventListener('change', function() {
        const travelEndDate = this.value;
        document.getElementById('RetDepDate').value = travelEndDate;
        document.getElementById('HotelCheckOut').value = travelEndDate;
        document.getElementById('CarDropDate').value = travelEndDate;
    });

    // Airport Codes sync
    document.getElementById('DepArrLocation').addEventListener('input', function() {
        const locationValue = this.value.toUpperCase(); // Standardize to uppercase
        this.value = locationValue; // Update field itself
        document.getElementById('RetDepLocation').value = locationValue;
        document.getElementById('CarPickUp').value = locationValue; // Assume car pickup is destination airport
    });

    document.getElementById('DepLocation').addEventListener('input', function() {
        const locationValue = this.value.toUpperCase(); // Standardize to uppercase
        this.value = locationValue; // Update field itself
        document.getElementById('RetArrLocation').value = locationValue;
        document.getElementById('CarDrop').value = locationValue; // Assume car drop is origin airport
    });

    // Time Calculations
    const addMinutes = (timeStr, minutesToAdd) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + minutesToAdd, 0, 0); // Set hours and minutes
        const fmtHrs = date.getHours().toString().padStart(2, '0');
        const fmtMins = date.getMinutes().toString().padStart(2, '0');
        return `${fmtHrs}:${fmtMins}`;
    };

    document.getElementById('DepArrTime').addEventListener('input', function() {
        document.getElementById('CarPUTime').value = addMinutes(this.value, 30); // Car pickup 30 mins after arrival
    });

    document.getElementById('RetDepTime').addEventListener('input', function() {
        document.getElementById('CarDropTime').value = addMinutes(this.value, -120); // Car drop 2 hours before departure
    });


    // --- On Page Load ---
    window.addEventListener('load', function() {
        // Trigger change events to set initial visibility
        document.getElementById('AirReservation').dispatchEvent(new Event('change'));
        document.getElementById('CarRental').dispatchEvent(new Event('change'));
        document.getElementById('HotelReservation').dispatchEvent(new Event('change'));
        document.getElementById('ETP').dispatchEvent(new Event('change'));
        document.getElementById('B2B').dispatchEvent(new Event('change'));
        // Ensure radio button state correctly sets return flight visibility
         const tripType = document.querySelector('input[name="TripType"]:checked');
         if (tripType) {
            tripType.dispatchEvent(new Event('change'));
         }


        // Load saved traveler information
        document.getElementById('travelerName').value = localStorage.getItem('travelerName') || '';
        document.getElementById('employeeNumber').value = localStorage.getItem('employeeNumber') || '';
        document.getElementById('travelerEmail').value = localStorage.getItem('travelerEmail') || '';
        document.getElementById('travelerPhone').value = localStorage.getItem('travelerPhone') || '';
        document.getElementById('homeMTC').value = localStorage.getItem('homeMTC') || '';
    });


    // --- Form Submission and PDF Generation ---
    document.getElementById('travelRequestForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(event.target);
        const { PDFDocument } = PDFLib; // Destructure for easier use

        // --- IMPORTANT: PDF Field Names ---
        // Verify these field names EXACTLY match those in your 'MyFile.pdf' template.
        // Use Adobe Acrobat's "Prepare Form" tool or similar to inspect your PDF.
        const pdfFieldNames = {
            // Traveler Info
            homeMTC: 'Dropdown46', // Example: Update if different
            travelerName: 'Name',
            employeeNumber: 'Employee#',
            travelerPhone: 'Phone',
            travelerEmail: 'Email',
            // Event Summary
            trainingLocation: 'Training Location',
            uid: 'UID',
            travelStart: 'Travel Start',
            travelEnd: 'Travel End',
            // Requirements Checkboxes (CRITICAL TO VERIFY THESE NAMES)
            airReservationCheck: 'Air Reservation',
            hotelReservationCheck: 'Hotel Reservation',
            carRentalCheck: 'Car Rental',
            povCheck: 'POV',
            etpCheck: 'ETP',
            b2bCheck: 'B2B',
            // Air Section
            roundTripCheck: 'Round Trip', // Verify this name
            oneWayCheck: 'One Way', // Verify this name
            depAirline: 'Dep Airline',
            depFlight: 'Dep flight', // Verify exact name
            depLocation: 'Dep location', // Verify exact name
            depArrLocation: 'Dep arr location', // Verify exact name
            depDate: 'Dep Date',
            depTime: 'Dep Time',
            depArrTime: 'Dep arr time', // Verify exact name
            airNotes: 'Air notes', // Verify exact name
            retAirline: 'Ret airline', // Verify exact name
            retFlight: 'Ret flight', // Verify exact name
            retDepLocation: 'Ret dep location', // Verify exact name
            retArrLocation: 'Ret arr location', // Verify exact name
            retDepDate: 'Ret dep date', // Verify exact name
            retDepTime: 'Ret dep time', // Verify exact name
            retArrTime: 'Ret arr time', // Verify exact name
            // Car Section
            oneWayCarCheck: 'One way', // Verify this name (might be different from air's one way)
            carPickUp: 'Car pick up', // Verify exact name
            carDate: 'car date', // Verify exact name
            carPUTime: 'car p/u time', // Verify exact name
            carDrop: 'car drop', // Verify exact name
            carDropDate: 'car drop date', // Verify exact name
            carDropTime: 'car drop time', // Verify exact name
            carNotes: 'car notes', // Verify exact name
            // Hotel Section
            travelerBookedHotel: 'Dropdown41', // Example: Update if different
            hotelCheckIn: 'Hotel check in', // Verify exact name
            hotelCheckOut: 'Hotel check out', // Verify exact name
            reservNumber: 'reserv #', // Verify exact name
            hotelLocation: 'Hotel location', // Verify exact name
            hotelNotes: 'Hotel Notes', // Verify exact name
            // ETP/B2B
            etpDropdown: 'ETP Drop down', // Verify exact name
            b2bUID: 'B2B UID', // Verify exact name
            // Comments
            comments: 'Comments'
        };
        // --- End PDF Field Names ---


        // Save traveler information to localStorage
        localStorage.setItem('travelerName', formData.get('travelerName') || '');
        localStorage.setItem('employeeNumber', formData.get('employeeNumber') || '');
        localStorage.setItem('travelerEmail', formData.get('travelerEmail') || '');
        localStorage.setItem('travelerPhone', formData.get('travelerPhone') || '');
        localStorage.setItem('homeMTC', formData.get('homeMTC') || '');

        try {
            // Load PDF template
            console.log("Loading PDF template: MyFile.pdf");
            const existingPdfBytes = await fetch('MyFile.pdf').then(res => {
                 if (!res.ok) { throw new Error(`Failed to fetch MyFile.pdf: ${res.statusText}`); }
                 return res.arrayBuffer();
            });
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const form = pdfDoc.getForm();
            console.log("PDF Template Loaded Successfully.");

            // Helper function to safely set text field value
            const setText = (fieldName, value) => {
                try {
                    if (fieldName && value !== null && value !== undefined) {
                        form.getTextField(fieldName).setText(value.toString());
                    } else if (fieldName) {
                         form.getTextField(fieldName).setText(''); // Clear if no value
                    }
                } catch (e) {
                    console.warn(`Could not find or set text field: ${fieldName}`, e);
                }
            };

            // Helper function to safely select dropdown value
            const setDropdown = (fieldName, value) => {
                try {
                    if (fieldName && value) {
                        form.getDropdown(fieldName).select(value);
                    }
                 } catch (e) {
                    console.warn(`Could not find or set dropdown: ${fieldName}`, e);
                 }
            };

             // Helper function to safely check/uncheck a checkbox
            const setCheckbox = (fieldName, isChecked) => {
                try {
                    if (!fieldName) return;
                    const checkbox = form.getCheckBox(fieldName);
                    console.log(`Setting checkbox '${fieldName}': ${isChecked ? 'Checked' : 'Unchecked'}`);
                    if (isChecked) {
                        checkbox.check();
                    } else {
                        checkbox.uncheck();
                    }
                } catch (e) {
                    console.warn(`Could not find or set checkbox: ${fieldName}`, e);
                }
            };

             // Helper function to safely select radio button value
             // NOTE: pdf-lib handles radio groups slightly differently. Often you check the specific button *within* the group.
             // You might need to find the specific field name for the 'RoundTrip' option and 'OneWay' option within the radio group.
             // For now, we'll map to the checkbox names assuming they might be individual fields. VERIFY THIS.
            const setRadio = (groupName, value) => {
                 try {
                    // Example: Assuming 'Round Trip' and 'One Way' are the actual export values or field names of the options
                    const roundTripFieldName = pdfFieldNames.roundTripCheck; // Placeholder - VERIFY
                    const oneWayFieldName = pdfFieldNames.oneWayCheck; // Placeholder - VERIFY

                    if (value === 'RoundTrip' && roundTripFieldName) {
                         form.getCheckBox(roundTripFieldName).check(); // Or getRadioGroup('GroupName').select('Round Trip') if it's a proper group
                         if(oneWayFieldName) form.getCheckBox(oneWayFieldName).uncheck();
                         console.log(`Setting radio '${groupName}': Round Trip (Field: ${roundTripFieldName})`);
                    } else if (value === 'OneWay' && oneWayFieldName) {
                         form.getCheckBox(oneWayFieldName).check(); // Or getRadioGroup('GroupName').select('One Way')
                         if(roundTripFieldName) form.getCheckBox(roundTripFieldName).uncheck();
                         console.log(`Setting radio '${groupName}': One Way (Field: ${oneWayFieldName})`);
                    } else {
                        // Uncheck both if value is invalid or fields aren't found
                        if(roundTripFieldName) form.getCheckBox(roundTripFieldName).uncheck();
                        if(oneWayFieldName) form.getCheckBox(oneWayFieldName).uncheck();
                         console.log(`Setting radio '${groupName}': Neither selected`);
                    }
                 } catch (e) {
                    console.warn(`Could not set radio button group: ${groupName}`, e);
                 }
            };


            // --- Fill Fields ---
            console.log("Starting to fill PDF fields...");

            // Traveler Info
            setDropdown(pdfFieldNames.homeMTC, formData.get('homeMTC'));
            setText(pdfFieldNames.travelerName, formData.get('travelerName'));
            setText(pdfFieldNames.employeeNumber, formData.get('employeeNumber'));
            setText(pdfFieldNames.travelerPhone, formData.get('travelerPhone'));
            setText(pdfFieldNames.travelerEmail, formData.get('travelerEmail'));

            // Event Summary
            setText(pdfFieldNames.trainingLocation, formData.get('TrainingLocation'));
            setText(pdfFieldNames.uid, formData.get('UID'));
            setText(pdfFieldNames.travelStart, formData.get('TravelStart'));
            setText(pdfFieldNames.travelEnd, formData.get('TravelEnd'));

            // Travel Requirements (Main Checkboxes)
            setCheckbox(pdfFieldNames.airReservationCheck, document.getElementById('AirReservation').checked);
            setCheckbox(pdfFieldNames.hotelReservationCheck, document.getElementById('HotelReservation').checked);
            setCheckbox(pdfFieldNames.carRentalCheck, document.getElementById('CarRental').checked);
            setCheckbox(pdfFieldNames.povCheck, document.getElementById('POV').checked);
            setCheckbox(pdfFieldNames.etpCheck, document.getElementById('ETP').checked);
            setCheckbox(pdfFieldNames.b2bCheck, document.getElementById('B2B').checked);

            // Air Reservation Details
            if (document.getElementById('AirReservation').checked) {
                const tripTypeValue = formData.get('TripType'); // Get value from radio button
                setRadio('TripType', tripTypeValue); // Use the radio helper - VERIFY PDF FIELD NAMES

                setText(pdfFieldNames.depAirline, formData.get('DepAirline'));
                setText(pdfFieldNames.depFlight, formData.get('DepFlight'));
                setText(pdfFieldNames.depLocation, formData.get('DepLocation'));
                setText(pdfFieldNames.depArrLocation, formData.get('DepArrLocation'));
                setText(pdfFieldNames.depDate, formData.get('DepDate'));
                setText(pdfFieldNames.depTime, formData.get('DepTime'));
                setText(pdfFieldNames.depArrTime, formData.get('DepArrTime'));
                setText(pdfFieldNames.airNotes, formData.get('AirNotes'));

                if (tripTypeValue === 'RoundTrip') {
                     setText(pdfFieldNames.retAirline, formData.get('RetAirline'));
                     setText(pdfFieldNames.retFlight, formData.get('RetFlight'));
                     setText(pdfFieldNames.retDepLocation, formData.get('RetDepLocation'));
                     setText(pdfFieldNames.retArrLocation, formData.get('RetArrLocation'));
                     setText(pdfFieldNames.retDepDate, formData.get('RetDepDate'));
                     setText(pdfFieldNames.retDepTime, formData.get('RetDepTime'));
                     setText(pdfFieldNames.retArrTime, formData.get('RetArrTime'));
                }
            }

            // Car Rental Details
            if (document.getElementById('CarRental').checked) {
                 setCheckbox(pdfFieldNames.oneWayCarCheck, document.getElementById('OneWayCar').checked); // Verify PDF field name
                 setText(pdfFieldNames.carPickUp, formData.get('CarPickUp'));
                 setText(pdfFieldNames.carDate, formData.get('CarDate'));
                 setText(pdfFieldNames.carPUTime, formData.get('CarPUTime'));
                 setText(pdfFieldNames.carDrop, formData.get('CarDrop'));
                 setText(pdfFieldNames.carDropDate, formData.get('CarDropDate'));
                 setText(pdfFieldNames.carDropTime, formData.get('CarDropTime'));
                 setText(pdfFieldNames.carNotes, formData.get('CarNotes'));
            }

             // Hotel Reservation Details
            if (document.getElementById('HotelReservation').checked) {
                 setDropdown(pdfFieldNames.travelerBookedHotel, formData.get('TravelerBookedHotel'));
                 setText(pdfFieldNames.hotelCheckIn, formData.get('HotelCheckIn'));
                 setText(pdfFieldNames.hotelCheckOut, formData.get('HotelCheckOut'));
                 setText(pdfFieldNames.reservNumber, formData.get('ReservNumber'));
                 setText(pdfFieldNames.hotelLocation, formData.get('HotelLocation'));
                 setText(pdfFieldNames.hotelNotes, formData.get('HotelNotes'));
            }

             // ETP/B2B Details
             if (document.getElementById('ETP').checked) {
                 setDropdown(pdfFieldNames.etpDropdown, formData.get('ETPDropdown'));
             }
             if (document.getElementById('B2B').checked) {
                 setText(pdfFieldNames.b2bUID, formData.get('B2BUID'));
             }

            // Comments
            setText(pdfFieldNames.comments, formData.get('Comments'));

            console.log("Finished filling fields. Updating appearances...");

            // Update appearance streams for fields
            //form.flatten(); // Uncomment this if checkboxes STILL don't appear - makes fields non-editable!
            form.updateFieldAppearances(); // Usually sufficient

            // --- Generate Filename ---
            const uid = formData.get('UID')?.trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'NO_UID'; // Sanitize UID
            const travelerName = formData.get('travelerName')?.trim() || 'NO_NAME';
            const travelStart = formData.get('TravelStart') || '';

            let lastNameFirstInitial = 'UNKNOWN';
            if (travelerName.includes(' ')) {
                const nameParts = travelerName.split(' ').filter(part => part.length > 0); // Handle multiple spaces
                const lastName = nameParts[nameParts.length - 1].toUpperCase();
                const firstInitial = nameParts[0].charAt(0).toUpperCase();
                lastNameFirstInitial = `${lastName}${firstInitial}`;
            } else if (travelerName.length > 0) {
                 lastNameFirstInitial = travelerName.toUpperCase(); // Handle single names
            }

            let formattedDate = 'NO_DATE';
            if (travelStart) {
                 try {
                    // Ensure date is parsed correctly, accounting for potential timezone issues if needed
                    const dateParts = travelStart.split('-'); // YYYY-MM-DD
                    const dateObj = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2])); // Use UTC to avoid timezone shifts
                    const day = dateObj.getUTCDate().toString().padStart(2, '0');
                    const month = dateObj.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
                    const year = dateObj.getUTCFullYear().toString().slice(-2);
                    formattedDate = `${day}_${month}_${year}`;
                 } catch (e) {
                     console.warn("Could not format date:", travelStart, e);
                     formattedDate = travelStart.replace(/-/g, '_'); // Fallback format
                 }
            }

            const fileName = `${uid}_HST_${lastNameFirstInitial}_${formattedDate}.pdf`;
            console.log(`Generated filename: ${fileName}`);

            // Serialize the PDF document
            console.log("Saving PDF document...");
            const pdfBytes = await pdfDoc.save();
            console.log("PDF Saved. Triggering download...");

            // Trigger download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Clean up

            console.log("Download triggered.");

        } catch (error) {
            console.error('Error during PDF generation:', error);
            alert(`An error occurred while processing the PDF: ${error.message}`);
        }
    });
