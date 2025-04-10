window.addEventListener('load', function() {
    // Cache le loader après le chargement complet
    const loader = document.querySelector('.loader-wrapper');
    setTimeout(() => {
        loader.classList.add('loader-hidden');
    }, 1000); // 1 seconde de délai pour montrer le loader
    
    // Supprime le loader après la transition
    loader.addEventListener('transitionend', () => {
        document.body.removeChild(loader);
    });
});