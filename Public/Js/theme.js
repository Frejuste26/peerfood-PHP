// Déclaration globale de la fonction toggleSidebar
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    const pageWrapper = document.querySelector('.page-wrapper');
    
    if (sidebar && pageWrapper) {
        sidebar.classList.toggle('collapsed');
        pageWrapper.classList.toggle('expanded');
        
        // Mise à jour de l'état
        const isSidebarOpen = !sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarState', isSidebarOpen ? 'open' : 'closed');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const mainWrapper = document.getElementById('main-wrapper');
    const sidebar = document.querySelector('.sidebar');
    const navbar = document.querySelector('.navbar');
    const pageWrapper = document.querySelector('.page-wrapper');
    const pageBreadcrumb = document.querySelector('.page-breadcrumb');
    const pageContainer = document.querySelector('.container-fluid');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    // État initial
    let lastScreenWidth = window.innerWidth;

    // Fonction pour gérer le responsive
    function handleResize() {
        const currentWidth = window.innerWidth;
        const sidebar = document.querySelector('.sidebar');
        
        if (currentWidth < 768 && lastScreenWidth >= 768) {
            // Passage en mode mobile
            if (sidebar) {
                sidebar.classList.add('mobile');
                if (!sidebar.classList.contains('collapsed')) {
                    toggleSidebar();
                }
            }
        } else if (currentWidth >= 768 && lastScreenWidth < 768) {
            // Passage en mode desktop
            if (sidebar) {
                sidebar.classList.remove('mobile');
                if (sidebar.classList.contains('collapsed')) {
                    toggleSidebar();
                }
            }
        }
        
        lastScreenWidth = currentWidth;
    }

    // Fonction pour gérer le thème sombre/clair
    function toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // Initialisation des éléments actifs
    [mainWrapper, sidebar, navbar, pageWrapper, pageBreadcrumb, pageContainer].forEach(element => {
        if (element) element.classList.add('active');
    });

    // Gestion du dropdown
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!dropdownMenu.contains(e.target) && !dropdownToggle.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // Gestion de la sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Gestion du thème
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Restauration de l'état de la sidebar
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'closed') {
        toggleSidebar();
    }

    // Restauration du thème
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }

    // Event listeners
    window.addEventListener('resize', handleResize);
    
    // Gestion du scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const st = window.pageYOffset || document.documentElement.scrollTop;
        if (navbar) {
            if (st > lastScrollTop && st > 80) {
                // Scroll vers le bas
                navbar.classList.add('navbar-hidden');
            } else {
                // Scroll vers le haut
                navbar.classList.remove('navbar-hidden');
            }
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    // Initialisation responsive
    handleResize();

    // Fonction pour gérer le loader dots
    function initDotsLoader() {
        const loaderDots = document.querySelector('.loader-dots');
        const pageContent = document.querySelector('.page-wrapper');

        if (loaderDots && pageContent) {
            // Cacher le contenu de la page initialement
            pageContent.style.opacity = '0';
            pageContent.style.visibility = 'hidden';
            
            // Ajouter une classe pour l'animation initiale
            loaderDots.classList.add('loading');

            // Attendre que tout soit chargé
            window.addEventListener('load', function() {
                setTimeout(() => {
                    // Masquer le loader avec une transition
                    loaderDots.style.opacity = '0';
                    loaderDots.style.visibility = 'hidden';
                    
                    // Afficher le contenu de la page
                    pageContent.style.transition = 'opacity 0.5s ease';
                    pageContent.style.visibility = 'visible';
                    pageContent.style.opacity = '1';
                    
                    // Nettoyer le loader après la transition
                    setTimeout(() => {
                        loaderDots.remove();
                    }, 500);
                }, 800); // Temps minimum de chargement
            });
        }
    }

    // Fonction pour mettre à jour l'état du chargement
    function updateLoadingState(progress) {
        const loaderDots = document.querySelector('.loader-dots');
        if (loaderDots) {
            // Ajuster l'opacité des points en fonction du progrès
            const dots = loaderDots.querySelectorAll('span');
            dots.forEach((dot, index) => {
                dot.style.animationDuration = `${1 - (progress * 0.5)}s`;
            });
        }
    }

    // Fonction pour vérifier le chargement des ressources
    function checkResourcesLoading() {
        const resources = {
            images: Array.from(document.images),
            scripts: Array.from(document.scripts),
            stylesheets: Array.from(document.styleSheets)
        };

        let totalResources = resources.images.length + resources.scripts.length + resources.stylesheets.length;
        let loadedResources = 0;

        function updateProgress() {
            const progress = loadedResources / totalResources;
            updateLoadingState(progress);
        }

        // Vérifier les images
        resources.images.forEach(img => {
            if (img.complete) {
                loadedResources++;
            } else {
                img.addEventListener('load', () => {
                    loadedResources++;
                    updateProgress();
                });
            }
        });

        // Vérifier les scripts
        resources.scripts.forEach(script => {
            if (script.complete || script.readyState === 'complete') {
                loadedResources++;
            } else {
                script.addEventListener('load', () => {
                    loadedResources++;
                    updateProgress();
                });
            }
        });

        // Mise à jour initiale
        updateProgress();
    }

    // Initialisation au chargement du DOM
    initDotsLoader();
    checkResourcesLoading();

    // Gestion des erreurs de chargement
    window.addEventListener('error', function(e) {
        const loaderDots = document.querySelector('.loader-dots');
        if (loaderDots && e.target.tagName) {
            loaderDots.style.animation = 'shake 0.5s ease-in-out';
        }
    }, true);

    // Fonction de secours pour forcer la fin du chargement
    function forceCompleteLoading() {
        const loaderDots = document.querySelector('.loader-dots');
        const pageContent = document.querySelector('.page-wrapper');
        
        if (loaderDots && pageContent) {
            loaderDots.style.opacity = '0';
            loaderDots.style.visibility = 'hidden';
            pageContent.style.visibility = 'visible';
            pageContent.style.opacity = '1';
            
            setTimeout(() => {
                loaderDots.remove();
            }, 500);
        }
    }

    // Timeout de sécurité (3 secondes)
    setTimeout(forceCompleteLoading, 3000);
});
