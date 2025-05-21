document.addEventListener('DOMContentLoaded', () => {
    const pet = document.querySelector('.pet');
    const speedButtons = document.querySelectorAll('.speed-button');
    
    // Set initial speed
    pet.classList.add('speed-medium');
    speedButtons[1].classList.add('active'); // Medium button is active by default
    
    speedButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            speedButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Remove all speed classes from pet
            pet.classList.remove('speed-slow', 'speed-medium', 'speed-fast');
            
            // Add new speed class
            const speed = button.dataset.speed;
            pet.classList.add(`speed-${speed}`);
        });
    });
    
    // We'll add more interactive features here later
    pet.addEventListener('click', () => {
        // Add click interaction later
        console.log('Pet clicked!');
    });
}); 