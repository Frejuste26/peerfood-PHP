document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:8086/customer';
    const tbody = document.querySelector('.table tbody');
    const selectAllCheckbox = document.getElementById('selectAll');
    const searchInput = document.querySelector('.search-box input');
    const filters = document.querySelectorAll('[data-filter]');
    const modal = document.getElementById('newClientModal');
    const addClientBtn = document.querySelector('[data-action="add-client"]');
    const closeButtons = document.querySelectorAll('[data-dismiss="modal"]');
    const saveClientBtn = document.getElementById('saveClient');
    const clientForm = document.getElementById('newClientForm');
    let currentPage = 1; // Page actuelle
    const clientsPerPage = 10; // Nombre de clients par page
    let totalClients = 0; // Nombre total de clients
    const clientName = document.getElementById("clientName");
    const clientUsername = document.getElementById("clientUsername");
    const clientPhone = document.getElementById("clientPhone");

    const clientNameHelp = document.getElementById("clientNameHelp");
    const clientUsernameHelp = document.getElementById("clientUsernameHelp");
    const clientPhoneHelp = document.getElementById("clientPhoneHelp");

    // ✅ Vérification du Nom Complet
    clientName.addEventListener("input", () => {
        const value = clientName.value.trim();
        if (!/^[a-zA-ZÀ-ÿ]+(?: [a-zA-ZÀ-ÿ]+)*$/.test(value)) {
            clientNameHelp.textContent = "⚠️ Entrez un nom complet valide (ex: Jean Dupont)";
            clientName.classList.add("is-invalid");
        } else {
            clientNameHelp.textContent = "✅ Nom valide";
            clientName.classList.remove("is-invalid");
            clientName.classList.add("is-valid");
        }
    });

    // ✅ Vérification du Nom d’Utilisateur (3 à 20 caractères, lettres/chiffres/_)
    clientUsername.addEventListener("input", () => {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!regex.test(clientUsername.value)) {
            clientUsernameHelp.textContent = "⚠️ 3 à 20 caractères (lettres, chiffres, _)";
            clientUsername.classList.add("is-invalid");
        } else {
            clientUsernameHelp.textContent = "✅ Nom d'utilisateur valide";
            clientUsername.classList.remove("is-invalid");
            clientUsername.classList.add("is-valid");
        }
    });

    // ✅ Vérification du Téléphone (format français)
    clientPhone.addEventListener("input", () => {
        const regex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        if (!regex.test(clientPhone.value)) {
            clientPhoneHelp.textContent = "⚠️ Format invalide (ex: 06 12 34 56 78)";
            clientPhone.classList.add("is-invalid");
        } else {
            clientPhoneHelp.textContent = "✅ Numéro valide";
            clientPhone.classList.remove("is-invalid");
            clientPhone.classList.add("is-valid");
        }
    });

    // ✅ Vérifier les cases à cocher de sélection
    function setupCheckboxListeners() {
        const checkboxes = document.querySelectorAll('tbody .form-check-input');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateSelectAll();
                updateBulkActions();
            });
        });
    }

    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('tbody .form-check-input');
        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
        updateBulkActions();
    });

    function updateSelectAll() {
        const checkboxes = document.querySelectorAll('tbody .form-check-input');
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        const someChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }

    function updateBulkActions() {
        const checkboxes = document.querySelectorAll('tbody .form-check-input');
        const selectedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
        const bulkActions = document.querySelector('.bulk-actions');

        if (selectedCount > 0) {
            if (!bulkActions) {
                createBulkActionsBar(selectedCount);
            } else {
                updateBulkActionsCount(selectedCount);
            }
        } else if (bulkActions) {
            bulkActions.classList.remove('show');
            bulkActions.addEventListener('transitionend', () => bulkActions.remove(), { once: true });
        }
    }

    // ✅ Modifier le statut du client avec confirmation
    async function handleStatusToggle(event) {
        if (event.target.classList.contains('status-toggle')) {
            const row = event.target.closest('tr');
            const clientId = row.querySelector('.client-id').textContent.replace('#CLD', '');
            const status = event.target.checked ? 'Enabled' : 'Disabled';
            const param = status === 'Enabled' ? 'enable' : 'disable';
    
            const userConfirmed = await showConfirmDialog({
                title: 'Confirmation',
                message: `Voulez-vous vraiment ${status === 'Enabled' ? 'activer' : 'désactiver'} ce client ?`,
                confirmText: 'Oui',
                cancelText: 'Non',
                type: status === 'Enabled' ? 'success' : 'warning'
            });
    
            if (!userConfirmed) {
                event.target.checked = !event.target.checked;
                return;
            }
    
            showLoader(); // 🟢 Afficher le loader avant la requête
    
            try {
                const response = await fetch(`http://localhost:8086/account/${clientId}/${param}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });
    
                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }
    
                showNotification(`Statut du client ${clientId} mis à jour`, 'info');
                fetchClients();
            } catch (error) {
                console.error('Erreur de mise à jour du statut:', error);
                showNotification('Erreur lors de la mise à jour du statut', 'error');
            } finally {
                hideLoader(); // 🔴 Cacher le loader après la réponse
            }
        }
    }
    
    function showLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('show');
    }
    
    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.remove('show');
    }
    

    // Amélioration de la recherche avec mise en surbrillance
    function highlightSearchResults(searchTerm) {
        const rows = document.querySelectorAll('tbody tr');
    
        if (!searchTerm) {
            rows.forEach(row => {
                row.querySelectorAll('td').forEach(td => {
                    td.innerHTML = td.innerHTML.replace(/<mark>(.*?)<\/mark>/g, '$1'); // Supprimer les balises <mark>
                });
            });
            return;
        }
    
        const regex = new RegExp(searchTerm, 'gi');
        rows.forEach(row => {
            row.querySelectorAll('td').forEach(td => {
                if (!td.querySelector('.actions')) {
                    const originalText = td.getAttribute('data-original-text') || td.innerText; // Sauvegarde le texte original
                    td.setAttribute('data-original-text', originalText);
                    td.innerHTML = originalText.replace(regex, match => `<mark>${match}</mark>`);
                }
            });
        });
    }
    
    // 🔍 Recherche en temps réel avec normalisation des accents
    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = this.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
        const rows = document.querySelectorAll('tbody tr');
        let resultsFound = false;
    
        rows.forEach(row => {
            const text = row.textContent.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const match = text.includes(searchTerm);
            row.style.display = match ? '' : 'none';
            if (match) resultsFound = true;
        });
    
        highlightSearchResults(searchTerm);
    
        // Afficher un message si aucun résultat
        const noResultsMessage = document.querySelector('.no-results');
        if (!resultsFound) {
            if (!noResultsMessage) {
                const message = document.createElement('tr');
                message.classList.add('no-results');
                message.innerHTML = `<td colspan="6" class="text-center text-muted">Aucun résultat trouvé</td>`;
                document.querySelector('tbody').appendChild(message);
            }
        } else {
            if (noResultsMessage) noResultsMessage.remove();
        }
    }, 300));    

    function createBulkActionsBar(count) {
        const bulkActions = document.createElement('div');
        bulkActions.className = 'bulk-actions';
        bulkActions.innerHTML = `
            <span class="bulk-actions-count">${count} sélectionné(s)</span>
            <button class="btn btn-outline-danger" data-action="bulk-delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Supprimer
            </button>
            <button class="btn btn-outline-secondary" data-action="bulk-export">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Exporter
            </button>
        `;
        
        document.body.appendChild(bulkActions);
        setTimeout(() => bulkActions.classList.add('show'), 100);
        
        // Gestionnaires d'événements pour les actions en masse
        bulkActions.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', handleBulkAction);
        });
    }

    function updateBulkActionsCount(count) {
        const countElement = document.querySelector('.bulk-actions-count');
        if (countElement) {
            countElement.textContent = `${count} sélectionné(s)`;
        }
    }

    function handleBulkAction(e) {
        const action = e.currentTarget.dataset.action;
        const checkboxes = document.querySelectorAll('tbody .form-check-input'); // Ajout
        const selectedRows = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.closest('tr'));
    
        switch(action) {
            case 'bulk-delete':
                confirmBulkDelete(selectedRows);
                break;
            case 'bulk-export':
                exportSelectedClients(selectedRows);
                break;
        }
    }    

    // ✅ Suppression en masse avec confirmation
    async function confirmBulkDelete(rows) {
        if (rows.length === 0) return;

        const userConfirmed = await showConfirmDialog({
            title: 'Suppression en masse',
            message: `Êtes-vous sûr de vouloir supprimer ${rows.length} client(s) ?`,
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger'
        });

        if (!userConfirmed) return;

        rows.forEach(row => deleteClient(row));
    }   

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

// Associer les événements après le rendu de la liste
function setupEventListeners() {
    tbody.addEventListener('change', handleStatusToggle);
    tbody.addEventListener('click', handleClientActions);
}


    // Fetch and display clients
    async function fetchClients(page = 1, status = "") {
        showLoader(); // 🟢 Afficher le loader avant l’appel API
    
        let apiUrlWithParams = `${apiUrl}?page=${page}&limit=${clientsPerPage}`;
        
        // 🔄 Convertir "active"/"inactive" en "Enabled"/"Disabled" si nécessaire
        const statusMapping = { "active": "Enabled", "inactive": "Disabled" };
        if (status && statusMapping[status]) {
            apiUrlWithParams += `&status=${statusMapping[status]}`;
        }
    
        try {
            const response = await fetch(apiUrlWithParams, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
    
            const json = await response.json();
            totalClients = json.total;
            renderClients(json.data);
            updatePagination();
        } catch (error) {
            console.error('Erreur de récupération des clients:', error);
            showNotification('Impossible de charger les clients.', 'error');
        } finally {
            hideLoader(); // 🔴 Cacher le loader après la réponse
        }
    }
    
    document.querySelector('[data-filter="status"]').addEventListener("change", function () {
        const selectedStatus = this.value;
        currentPage = 1; // 🔄 Réinitialiser à la première page
        fetchClients(currentPage, selectedStatus); // 📡 Rafraîchir la liste des clients avec le statut sélectionné
    });
    
    document.querySelector('[data-action="reset-filters"]').onclick = () => {
        currentPage = 1; // 🔄 Réinitialiser à la première page
    
        // ✅ Réinitialiser les champs de filtre et de recherche
        document.querySelector('[data-filter="status"]').value = ''; 
        document.querySelector('#search-input').value = ''; 
        document.querySelector('#selectAll').checked = false; 
    
        // ✅ Cacher la barre d'actions en masse uniquement si elle existe
        const bulkActions = document.querySelector('.bulk-actions');
        if (bulkActions) {
            bulkActions.classList.remove('show');
        }
    
        // ✅ Réinitialiser le compteur de sélection uniquement si l'élément existe
        const bulkActionsCount = document.querySelector('.bulk-actions-count');
        if (bulkActionsCount) {
            bulkActionsCount.textContent = '';
        }
    
        // ✅ Rafraîchir la liste des clients sans filtre
        fetchClients();
    };
    
    // Render clients in the table
    function renderClients(clients) {
        tbody.innerHTML = '';

        clients.forEach(client => {
            const status = client.status === 'Enabled' ? 'success' : 'warning';
            const isChecked = client.status === 'Enabled' ? 'checked' : '';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="form-check-input"></td>
                <td>
                    <div class="client-info">
                        <div class="client-avatar">${client.lastname?.charAt(0).toUpperCase() ?? ''}${client.firstname?.charAt(0).toUpperCase() ?? ''}</div>
                        <div class="client-details">
                            <h6>${client.lastname || 'Inconnu'} ${client.firstname || ''}</h6>
                            <span class="client-id">${formatClientId(client.id)}</span>
                        </div>
                    </div>
                </td>
                <td>${client.username || 'Non renseigné'}</td>
                <td>${client.phone || 'Non renseigné'}</td>
                <td>
                    <div class="status-container d-flex align-items-center gap-2">
                        <span class="status-badge badge ${status}">${client.status || 'Inconnu'}</span>
                        <label class="status-switch">
                            <input type="checkbox" class="status-toggle" ${isChecked}>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </td>
                <td>
                    <div class="actions"> 
                            <button class="btn btn-sm btn-icon" data-action="view" title="Voir"> 
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"> 
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/> 
                                </svg> 
                            </button> 
                            <button class="btn btn-sm btn-icon" data-action="edit" title="Modificateur"> 
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"> 
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/> 
                                </svg> 
                            </button> 
                            <button class="btn btn-sm btn-icon text-danger" data-action="delete" title="Supprimer"> 
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"> 
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/> 
                                </svg> 
                            </button> 
                        </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById("paginationInfo").textContent = `Affichage de ${(currentPage - 1) * clientsPerPage + 1}-${Math.min(currentPage * clientsPerPage, totalClients)} sur ${totalClients} clients`;
        setupEventListeners();
    }

    function updatePagination() {
    const totalPages = Math.ceil(totalClients / clientsPerPage);
    const paginationElement = document.getElementById("pagination");
    paginationElement.innerHTML = '';

    // 🔹 Bouton "Précédent"
    const prevButton = document.createElement("li");
    prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = `<a class="page-link" href="#" aria-label="Page précédente">Précédent</a>`;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchClients(currentPage);
        }
    });
    paginationElement.appendChild(prevButton);

    // 🔹 Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener("click", () => {
            currentPage = i;
            fetchClients(currentPage);
        });
        paginationElement.appendChild(pageItem);
    }

    // 🔹 Bouton "Suivant"
    const nextButton = document.createElement("li");
    nextButton.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = `<a class="page-link" href="#" aria-label="Page suivante">Suivant</a>`;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchClients(currentPage);
        }
    });
    paginationElement.appendChild(nextButton);
}

addClientBtn.addEventListener(
    "click", () => {
        modal.classList.add('show');

    }
);


function exportClientsToCSV() {
    showLoader(); // 🟢 Afficher le loader avant l'exportation

    // Récupérer tous les clients sans pagination
    fetch(`${apiUrl}?limit=10000`)
        .then(response => response.json())
        .then(json => {
            const clients = json.data;
            if (!clients || clients.length === 0) {
                showNotification("Aucun client à exporter.", "warning");
                return;
            }

            // Création de l'en-tête du fichier CSV
            let csvContent = "ID,Nom,Prénom,Nom d'utilisateur,Téléphone,Statut\n";

            // Ajout des clients
            clients.forEach(client => {
                csvContent += `${client.id},"${client.lastname}","${client.firstname}","${client.username}","${client.phone}","${client.status}"\n`;
            });

            // Création du fichier CSV
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "clients.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification("Exportation réussie !", "success");
        })
        .catch(error => {
            console.error("Erreur d'exportation CSV :", error);
            showNotification("Échec de l'exportation.", "error");
        })
        .finally(() => {
            hideLoader(); // 🔴 Cacher le loader après l'exportation
        });
}

document.getElementById("exportCsv").addEventListener("click", exportClientsToCSV);


    function formatClientId(id) {
        return id > 0 ? `#CLD${String(id).padStart(4, '0')}` : '';
    }

    function setupEventListeners() {
        tbody.addEventListener('change', handleStatusToggle);
        tbody.addEventListener('click', handleClientActions);
    }

    async function addClient(event) {
        event.preventDefault();
    
        const fullname = document.getElementById('clientName').value.trim();
        const username = document.getElementById('clientUsername').value.trim();
        const phone = document.getElementById('clientPhone').value.trim();
    
        const [lastname, firstname] = fullname.includes(" ") ? fullname.split(" ") : ["", ""];
    
        // 🔍 Vérification des erreurs avant l’envoi
        if (!/^[a-zA-ZÀ-ÿ]+(?: [a-zA-ZÀ-ÿ]+)*$/.test(fullname)) {
            showNotification("❌ Nom complet invalide", "error");
            return;
        }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            showNotification("❌ Nom d'utilisateur invalide (3-20 caractères)", "error");
            return;
        }
        if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(phone)) {
            showNotification("❌ Numéro de téléphone invalide", "error");
            return;
        }
    
        const clientData = { lastname, firstname, username, phone };
    
        try {
            const response = await fetch(`${apiUrl}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });
    
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
    
            showNotification("✅ Client ajouté avec succès !", "success");
            fetchClients(); // 🔄 Rafraîchir la liste
            clientForm.reset();
            modal.classList.remove('show');
        } catch (error) {
            console.error("❌ Erreur lors de l’ajout du client:", error);
            showNotification(`❌ ${error.message}`, "error");
        }
    }
    
    

    // Modifier un client
    function editClient(row) {
        const clientId = row.querySelector('.client-id').textContent.replace('#CLD', '');
        const clientName = row.querySelector('.client-details h6').textContent;
        const clientUsername = row.cells[2].textContent;
        const clientPhone = row.cells[3].textContent;

        document.getElementById('clientName').value = clientName;
        document.getElementById('clientUsername').value = clientUsername;
        document.getElementById('clientPhone').value = clientPhone;
        saveClientBtn.setAttribute('data-edit-id', clientId);

        modal.classList.add('show');
    }

    async function updateClient(event) {
        event.preventDefault();
        const clientId = saveClientBtn.getAttribute('data-edit-id');
        if (!clientId) return;

        const updatedData = {
            lastname: document.getElementById('clientName').value,
            username: document.getElementById('clientUsername').value,
            phone: document.getElementById('clientPhone').value
        };

        try {
            const response = await fetch(`${apiUrl}/update/${clientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            showNotification('Client mis à jour avec succès !', 'success');
            fetchClients();
            clientForm.reset();
            modal.classList.remove('show');
            saveClientBtn.removeAttribute('data-edit-id');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du client:', error);
            showNotification('Échec de la mise à jour.', 'error');
        }
    }

    // ✅ Suppression d’un client avec confirmation
    async function deleteClient(row) {
        const clientId = row.querySelector('.client-id').textContent.replace('#CLD', '');
    
        const userConfirmed = await showConfirmDialog({
            title: 'Supprimer le client',
            message: `Êtes-vous sûr de vouloir supprimer le client ${clientId} ?`,
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger'
        });
    
        if (!userConfirmed) return;
    
        showLoader(); // 🟢 Afficher le loader avant la requête
    
        try {
            const response = await fetch(`${apiUrl}/delete/${clientId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
    
            showNotification(`Client ${clientId} supprimé avec succès !`, 'success');
            fetchClients();
        } catch (error) {
            console.error('Erreur lors de la suppression du client:', error);
            showNotification('Échec de la suppression du client.', 'error');
        } finally {
            hideLoader(); // 🔴 Cacher le loader après la réponse
        }
    }
    

    function handleClientActions(event) {
        const action = event.target.closest('[data-action]')?.dataset.action;
        const row = event.target.closest('tr');

        if (action && row) {
            switch (action) {
                case 'view':
                    showClientDetails(row);
                    break;
                case 'edit':
                    editClient(row);
                    break;
                case 'delete':
                    deleteClient(row);
                    break;
            }
        }
    }

    function showClientDetails(row) {
        const clientId = row.querySelector('.client-id').textContent.replace('#CLD', '');
        const clientName = row.querySelector('.client-details h6').textContent;
        const clientUsername = row.cells[2].textContent;
        const clientPhone = row.cells[3].textContent;
        const clientStatus = row.cells[4].textContent;
        const detailsModal = document.createElement('div');
        detailsModal.classList.add('modal');
        detailsModal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails du client ${clientId}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h6>${clientName}</h6>
                        <p>Username : ${clientUsername}</p>
                        <p>Téléphone : ${clientPhone}</p>
                        <p>Statut : ${clientStatus}</p>
                    </div>
                </div>
            </div>          
        `;
        document.body.appendChild(detailsModal);
        setTimeout(() => detailsModal.classList.add('show'), 10);
        detailsModal.querySelector('.close').addEventListener('click', () => {
            detailsModal.classList.remove('show');
            setTimeout(() => detailsModal.remove(), 300);
        });
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            ${getNotificationIcon(type)}
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <div class="notification-progress"></div>
            </div>
        `;

        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));

        const progress = notification.querySelector('.notification-progress');
        progress.style.animation = 'notification-progress 3s linear forwards';

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

     // ✅ Fonction d'affichage des dialogues modaux de confirmation
     function showConfirmDialog({ title, message, confirmText, cancelText, type }) {
        return new Promise(resolve => {
            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog modal';
            dialog.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5>${title}</h5>
                            <button type="button" class="modal-close" data-action="cancel">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                            <button type="button" class="btn btn-${type}" data-action="confirm">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);
            setTimeout(() => dialog.classList.add('show'), 50);

            function handleAction(confirmed) {
                dialog.classList.remove('show');
                setTimeout(() => {
                    dialog.remove();
                    resolve(confirmed);
                }, 300);
            }

            dialog.addEventListener('click', e => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (action === 'confirm') handleAction(true);
                if (action === 'cancel') handleAction(false);
                if (e.target === dialog) handleAction(false);
            });
        });
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="var(--green-500)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
            case 'error':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="var(--red-500)"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
            default:
                return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="var(--blue-500)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
        }
    }


    saveClientBtn.addEventListener('click', function(event) {
        const isEditing = saveClientBtn.hasAttribute('data-edit-id');
        if (isEditing) {
            modal.classList.remove('show');
            updateClient(event);
        } else {
            modal.classList.remove('show');
            addClient(event);
        }
    });

    closeButtons.forEach(
        button => button.addEventListener('click', () => modal.classList.remove('show'))
    );

    modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.remove('show');
    }
    });


    fetchClients();
});
