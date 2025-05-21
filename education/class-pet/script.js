document.addEventListener('DOMContentLoaded', () => {
    const pet = document.querySelector('.pet');
    const speedButtons = document.querySelectorAll('.speed-button');
    const treatButton = document.querySelector('.treat-button');
    const treatsContainer = document.querySelector('.treats-container');
    const container = document.querySelector('.class-pet-container');
    
    let isEating = false;
    let currentSpeed = 'medium';
    
    // Set initial speed
    pet.classList.add('speed-medium');
    speedButtons[1].classList.add('active'); // Medium button is active by default
    
    speedButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isEating) return; // Don't change speed while eating
            
            // Remove active class from all buttons
            speedButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Remove all speed classes from pet
            pet.classList.remove('speed-slow', 'speed-medium', 'speed-fast');
            
            // Add new speed class
            const speed = button.dataset.speed;
            currentSpeed = speed;
            pet.classList.add(`speed-${speed}`);
        });
    });
    
    treatButton.addEventListener('click', () => {
        if (isEating) return; // Don't drop treat while eating
        
        // Create treat
        const treat = document.createElement('div');
        treat.className = 'treat';
        
        // Random horizontal position
        const maxX = container.offsetWidth - 15; // 15 is treat width
        const randomX = Math.random() * maxX;
        treat.style.left = `${randomX}px`;
        
        // Add treat to container
        treatsContainer.appendChild(treat);
        
        // Start falling animation
        requestAnimationFrame(() => {
            treat.classList.add('falling');
        });
        
        // After treat falls, make pet eat it
        setTimeout(() => {
            // Get treat position
            const treatRect = treat.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const treatX = treatRect.left - containerRect.left;
            
            // Stop current animation
            pet.style.animation = 'none';
            
            // Move pet to treat
            pet.style.transform = `translateX(${treatX - 25}px)`; // 25 is half of pet width
            
            // Start eating animation
            isEating = true;
            pet.classList.add('eating');
            
            // Remove treat
            treat.remove();
            
            // After eating, return to normal
            setTimeout(() => {
                pet.classList.remove('eating');
                pet.style.transform = '';
                pet.style.animation = '';
                pet.classList.add(`speed-${currentSpeed}`);
                isEating = false;
            }, 1000);
        }, 1000);
    });
    
    // We'll add more interactive features here later
    pet.addEventListener('click', () => {
        // Add click interaction later
        console.log('Pet clicked!');
    });
}); 