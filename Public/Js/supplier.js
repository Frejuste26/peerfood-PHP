document.addEventListener('DOMContentLoaded', function() {
    // Gestion de la sélection multiple
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('tbody .form-check-input');

    selectAllCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        updateBulkActions();
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectAll();
            updateBulkActions();
        });
    });

    function updateSelectAll() {
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        const someChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }

    // Amélioration de la recherche avec mise en surbrillance
    function highlightSearchResults(searchTerm) {
        const rows = document.querySelectorAll('tbody tr');
        if (!searchTerm) {
            rows.forEach(row => {
                row.querySelectorAll('td').forEach(td => {
                    td.innerHTML = td.innerHTML.replace(/<mark>(.*?)<\/mark>/g, '$1');
                });
            });
            return;
        }

        const regex = new RegExp(searchTerm, 'gi');
        rows.forEach(row => {
            row.querySelectorAll('td').forEach(td => {
                if (!td.querySelector('.actions')) {
                    const text = td.innerText;
                    td.innerHTML = text.replace(regex, match => `<mark>${match}</mark>`);
                }
            });
        });
    }

    // Recherche en temps réel
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });

        highlightSearchResults(searchTerm);
    }, 300));

    // Actions sur les fournisseurs
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            switch(action) {
                case 'import':
                    showImportModal();
                    break;
                case 'edit':
                    editSupplier(this.closest('tr'));
                    break;
                case 'delete':
                    deleteSupplier(this.closest('tr'));
                    break;
            }
        });
    });

    // Fonctions utilitaires
    function updateBulkActions() {
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

    function confirmBulkDelete(rows) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${rows.length} client(s) ?`)) {
            rows.forEach(row => deleteSupplier(row));
        }
    }

    function exportSelectedClients(rows) {
        const data = rows.map(row => ({
            id: row.querySelector('.id').textContent,
            name: row.querySelector('.name').textContent,
            phone: row.querySelector('.phone').textContent,
            address: row.querySelector('.address').textContent
        }));
        
        const csv = convertToCSV(data);
        downloadCSV(csv, 'clients_export.csv');
    }

    function convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const rows = data.map(obj => headers.map(header => obj[header]));
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    function downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    // Fonction de débordement
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    

    function showImportModal() {
        const modal = document.getElementById('importModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        const importButton = document.getElementById('importButton');
        importButton.onclick = () => {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const data = reader.result;
                console.log(data);
            }
        }
    }

    function editSupplier(row) {
        const supplierData = {
            numSupply: row.querySelector('.id').textContent,
            nameSupply: row.querySelector('.name').textContent,
            telephone: row.querySelector('.phone').textContent,
            address: row.querySelector('.adresse').textContent
        };
        openModalForEdit(supplierData, row);
    }
    
    function openModalForEdit(supplierData, rowToUpdate) {
        const editmodal = document.getElementById('editSupplierModal'); // Déclaration manquante
        const inputs = {
            nameSupply: document.getElementById('editnameSupply'),
            telephone: document.getElementById('edittelephone'),
            address: document.getElementById('editaddress')
        };
    
        // Correction de la variable supplierData.nameSuppy -> supplierData.nameSupply
        inputs.nameSupply.value = supplierData.nameSupply; 
        inputs.telephone.value = supplierData.telephone; // Correction : 'phoneSupplier' -> 'telephone'
        inputs.address.value = supplierData.address; // Correction : 'location' -> 'address'
    
        editmodal.dataset.editMode = 'true';
        editmodal.dataset.rowId = supplierData.numSupply; // Correction : 'supplierData.id' -> 'supplierData.numSupply'
    
        const saveButton = document.getElementById('editSupplier');
        const originalClickHandler = saveButton.onclick;

        function validateForm() {
            return inputs.nameSupply.value.trim() && inputs.telephone.value.trim() && inputs.address.value.trim();
        }
    
        saveButton.onclick = async () => {
            if (validateForm()) {
                try {
                    saveButton.classList.add('btn-loading');
                    await new Promise(resolve => setTimeout(resolve, 1000));
    
                    const updatedData = {
                        numSupply: supplierData.numSupply,
                        nameSupply: inputs.nameSupply.value.trim(),
                        telephone: inputs.telephone.value.trim(),
                        address: inputs.address.value.trim(),
                    };
    
                    const response = await fetch(`http://localhost:8086/supplier/update/${supplierData.numSupply}`, 
                        { 
                            method: 'PUT', 
                            headers: { 'Content-Type': 'application/json' }, 
                            body: JSON.stringify(updatedData) 
                        }
                    );
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Erreur lors de la sauvegarde.');
                    }
    
                    const data = await response.json();
                    closeModal();
                    showNotification(data.message, 'success');
                    window.location.reload();
                } catch (error) {
                    showNotification(error.message, 'error');
                    console.error(error);
                } finally {
                    saveButton.classList.remove('btn-loading');
                }
            }
        };
    
        const cleanup = () => {
            saveButton.onclick = originalClickHandler;
            editmodal.dataset.editMode = 'false';
            delete editmodal.dataset.rowId;
            document.querySelector('.modal-title').textContent = 'Modifier Fournisseur'; // Correction du texte 'Nouveau Fournisseur'
            document.querySelector('.button-text').textContent = 'Enregistrer'; // Correction du texte
        };
    
        const originalCloseModal = closeModal;
        closeModal = () => {
            originalCloseModal();
            cleanup();
        };
    }

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
            if (action === 'confirm') handleAction(true); // Confirm the action
            if (action === 'cancel') handleAction(false); // Cancel the action
            if (e.target === dialog) handleAction(false); // Click outside to cancel
        });
    });
}

function animateRowDeletion(row) {
    return new Promise(resolve => {
        row.style.transition = 'all 0.5s ease';
        row.style.transform = 'translateX(100%)';
        row.style.opacity = '0';

        setTimeout(() => {
            row.style.height = row.offsetHeight + 'px'; // Get current height to enable height transition
            row.style.height = '0';
            row.style.padding = '0';
            row.style.margin = '0';

            setTimeout(() => {
                row.remove();
                resolve();
            }, 500); // Wait for the animation to complete
        }, 500); // Wait before starting the animation
    });
}

async function deleteSupplier(row) {
    const supplierName = row.querySelector('.name').textContent;
    const supplierId = row.querySelector('.id').textContent;

    // Wait for user confirmation before proceeding with the deletion
    const confirmation = await showConfirmDialog({
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer le fournisseur "${supplierName}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'warning'
    });

    // If user confirmed, proceed with the deletion
    if (confirmation) {
        try {
            const response = await fetch(`http://localhost:8086/supplier/delete/${supplierId}`,
                { method: 'DELETE' }
            );
            if (!response.ok) {
                const errorData = await response.json();
                closeModal();
                showNotification(errorData.message || 'error');
                console.error(errorData);
            }
            closeModal();
            await animateRowDeletion(row);
            showNotification('Fournisseur supprimé avec succès','success');
        } catch (error) {
            closeModal();
            showNotification(error.message, 'error');
            console.error(error);
        }
    }
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

    // Gestion du modal
    const modal = document.getElementById('newSupplierModal');
    const editmodal = document.getElementById('editSupplierModal');
    const addSupplierBtn = document.querySelector('[data-action="add-supplier"]');
    const editSupplierBtn = document.querySelectorAll('[data-action="edit"]');
    const closeButtons = document.querySelectorAll('[data-dismiss="modal"]');
    const SupplierForm = document.getElementById('newSupplierForm');

    // Ouvrir le modal
    addSupplierBtn.addEventListener('click', () => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    });

    editSupplierBtn.forEach(
        btn => btn.addEventListener('click', () => {
            editmodal.classList.add('show');
            document.body.style.overflow = 'hidden';
        })
    );

    // Fermer le modal
    function closeModal() {
        modal.classList.remove('show');
        editmodal.classList.remove('show');
        document.body.style.overflow = '';
        SupplierForm.reset();
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Fermer le modal en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Amélioration de la gestion du modal
    function initializeModal() {
        const inputs = {
            name: document.getElementById('nameSupply'),
            phone: document.getElementById('telephone'),
            address: document.getElementById('address')
        };

        const messages = {
            name: 'Le nom doit contenir uniquement des lettres et espaces.',
            address: 'L\'adresse doit contenir uniquement des lettres, chiffres et espaces.',
            phone: 'Format invalide (ex: 06 12 34 56 78).',
            required: 'Ce champ est requis.'
        };

        // Map de validation
        const validators = {
            name: (value) => /^[a-zA-ZÀ-ÿ]+(?: [a-zA-ZÀ-ÿ]+)*$/.test(value),
            address: (value) => /^[a-zA-Z0-9\s,'-]*$/.test(value),
            phone: (value) => /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(value)
        };

        // Ajouter un écouteur pour chaque champ
        Object.keys(inputs).forEach((key) => {
            const input = inputs[key];
            input.addEventListener('input', (e) => handleValidation(e, validators[key], messages[key]));
        });

        // Gestion de la soumission du formulaire
        document.getElementById('saveSupplier').addEventListener('click', async () => {
            if (validateForm(inputs, validators, messages)) {
                try {
                    await saveSupplier({
                        nameSupply: inputs.name.value.trim(),
                        telephone: inputs.phone.value.trim(),
                        address: inputs.address.value.trim()
                    });
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            }
        });

        // Gestion des aperçus (facultatif)
        inputs.name.addEventListener('input', updateNamePreview);
        inputs.address.addEventListener('input', updateAddressPreview);

        // Fonctions utilitaires
        function handleValidation(event, validator, message) {
            const { target } = event;
            const value = target.value.trim();
            if (!value || validator(value)) {
                clearFieldError(target);
            } else {
                showFieldError(target, message);
            }
        }

        function validateForm(inputs, validators, messages) {
            let isValid = true;
            Object.keys(inputs).forEach((key) => {
                const input = inputs[key];
                if (!input.value.trim()) {
                    showFieldError(input, messages.required);
                    isValid = false;
                } else if (!validators[key](input.value.trim())) {
                    showFieldError(input, messages[key]);
                    isValid = false;
                } else {
                    clearFieldError(input);
                }
            });
            return isValid;
        }

        function showFieldError(element, message) {
            element.classList.add('invalid');
            const messageEl = element.nextElementSibling;
            if (messageEl && messageEl.classList.contains('validation-message')) {
                messageEl.textContent = message;
                messageEl.style.display = 'block';
            }
        }

        function clearFieldError(element) {
            element.classList.remove('invalid');
            const messageEl = element.nextElementSibling;
            if (messageEl && messageEl.classList.contains('validation-message')) {
                messageEl.style.display = 'none';
            }
        }

        function updateNamePreview(event) {
            const preview = document.querySelector('.preview-initials');
            if (preview) {
                preview.textContent = event.target.value
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();
            }
        }

        function updateAddressPreview(event) {
            const preview = document.querySelector('.preview-postal-code');
            if (preview) {
                preview.textContent = event.target.value.split(' ').pop();
            }
        }

        async function saveSupplier(formData) {
            try {
                const response = await fetch('http://localhost:8086/supplier/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erreur lors de la sauvegarde.');
                }

                const data = await response.json();
                closeModal();
                showNotification(data.message, 'success');
                window.location.reload();
            } catch (error) {
                closeModal();
                throw error;
            }
        }
    }

    initializeModal();
    
});