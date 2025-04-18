document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
    const selected = dropdown.querySelector('.dropdown-selected');
    const options = dropdown.querySelector('.dropdown-options');

    selected.addEventListener('click', () => {
        dropdown.classList.toggle('open');
    });

    options.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', () => {
            selected.textContent = option.textContent;
            dropdown.classList.remove('open');
            // You can trigger filter logic here
            console.log('Selected value:', option.dataset.value);
        });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
});
document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
    const selected = dropdown.querySelector('.dropdown-selected');
    const options = dropdown.querySelector('.dropdown-options');

    selected.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
        });
        dropdown.classList.toggle('active');
    });

    options.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', () => {
            selected.textContent = option.textContent;
            selected.setAttribute('data-value', option.getAttribute('data-value'));
            dropdown.classList.remove('active');
            // Add your sorting logic here based on option.getAttribute('data-value')
        });
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
    }
});

