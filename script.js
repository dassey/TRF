document.getElementById('airbox').addEventListener('change', function(event) {
    if (event.target.checked) {
        document.querySelector('.subsection-container').style.display = 'flex';
    } else {
        document.querySelector('.subsection-container').style.display = 'none';
    }
});
