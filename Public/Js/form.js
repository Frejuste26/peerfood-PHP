document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const mainContent = document.querySelector('.container');
    const form = document.getElementById('login-form');
    const alert = document.querySelector('.alert');
    const successMessage = document.getElementById('success-message');
    const submitButton = document.getElementById('submit-btn');

    // Gestion du loader
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            mainContent.style.display = 'block';
            mainContent.style.animation = 'fadeIn 0.5s';
        }, 500);
    }, 1000);

    // Validation du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        // Validation des champs
        const username = formData.get('username');
        const password = formData.get('password');
        
        if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
            showError('Le nom d\'utilisateur doit contenir entre 3 et 20 caractères (lettres, chiffres, underscore uniquement)');
            return;
        }

        if (password.length < 6 || password.length > 20) {
            showError('Le mot de passe doit contenir entre 6 et 20 caractères');
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Connexion en cours...';

            const response = await fetch('/admin/login', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess();
                setTimeout(() => window.location.href = '/admin/dashboard', 1500);
            } else {
                showError(data.message || 'Erreur lors de la connexion');
            }
        } catch (error) {
            showError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Se connecter';
        }
    });

    function showError(message) {
        alert.textContent = message;
        alert.style.display = 'block';
        alert.style.color = '#dc3545';
        successMessage.style.display = 'none';
    }

    function showSuccess() {
        alert.style.display = 'none';
        successMessage.style.display = 'block';
        successMessage.style.color = '#28a745';
    }
});