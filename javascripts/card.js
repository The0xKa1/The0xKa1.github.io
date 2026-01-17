const numbers = document.querySelectorAll('.number');
    const cards = document.querySelectorAll('.card');

    numbers.forEach(number => {
        number.addEventListener('mouseenter', () => {
            const cardId = number.getAttribute('data-card');
            const card = document.getElementById(cardId);
            card.classList.add('active');
        });

        number.addEventListener('mouseleave', () => {
            const cardId = number.getAttribute('data-card');
            const card = document.getElementById(cardId);
            card.classList.remove('active');
        });
    });