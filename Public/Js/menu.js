document.addEventListener("DOMContentLoaded", function () {
    // Functions 
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

    const tabs = document.querySelectorAll(".view-tab");
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            // Retirer la classe active des autres onglets
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            // Masquer toutes les vues
            document.querySelectorAll(".view").forEach((v) => {
                if (v) v.style.display = "none"; // Vérification supplémentaire
            });

            // Afficher la vue associée uniquement si elle existe
            const view = tab.dataset.view;
            const targetView = document.getElementById(view);
            if (targetView) {
                targetView.style.display = "block";
            } else {
                console.warn(`View with ID "${view}" not found.`);
            }

            // Remonter en haut de la page
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

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
            rows.forEach(row => deleteCategory(row));
        }
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
    
     // Gestion du modal
     const modal = document.getElementById('newCategoryModal');
     const editmodal = document.getElementById('editCategoryModal');
     const addCategoryBtn = document.querySelector('[data-action="add-category"]');
     const editCategoryBtn = document.querySelectorAll('[data-action="edit"]');
     const closeButtons = document.querySelectorAll('[data-dismiss="modal"]');
     const CategoryForm = document.getElementById('newCategoryForm');
 
     // Ouvrir le modal
     addCategoryBtn.addEventListener('click', () => {
         modal.classList.add('show');
         document.body.style.overflow = 'hidden';
     });
 
     editCategoryBtn.forEach(
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
         CategoryForm.reset();
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

     function initializeModal() {
        const input = document.getElementById('name');
        const saveButton = document.getElementById('saveCategory');
    
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const name = input.value.trim();
    
            if (name === '') {
                showNotification("Le nom ne peut pas être vide", "error");
                return;
            }
    
            await saveCategory(name);
        });
    
        async function saveCategory(name) {
            try {
                // Désactiver le bouton et ajouter le spinner
                saveButton.disabled = true;
                saveButton.innerHTML = `<span class="spinner"></span> Enregistrement...`;
    
                const response = await fetch('http://localhost:8086/category', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ designation: name })
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.message || "Une erreur est survenue");
                }
    
                showNotification(data.message || "Catégorie ajoutée avec succès", "success");
                closeModal();
            } catch (error) {
                console.error("Failed to add category:", error);
                showNotification(error.message, "error");
            } finally {
                // Réactiver le bouton et restaurer le texte original
                saveButton.disabled = false;
                saveButton.innerHTML = "Enregistrer";
            }
        }
    }
    

    function editCategory(row) {
        const categoryData = {
            idCat: row.querySelector('.id').textContent,
            designation: row.querySelector('.name').textContent
        };
        openModalForEdit(categoryData, row);
    }

    function openModalForEdit(categoryData, rowToUpdate) {
        const editmodal = document.getElementById('editCategoryModal'); // Déclaration manquante
        const designation = document.getElementById('editName');
    
        designation.value = categoryData.designation; 
    
        editmodal.dataset.editMode = 'true';
        editmodal.dataset.rowId = categoryData.idCat; 
        const saveButton = document.getElementById('updateCategory');
        const originalClickHandler = saveButton.onclick;

        function validateForm() {
            return designation.value.trim()!== '';
        }
    
        saveButton.onclick = async () => {
            if (validateForm()) {
                try {
                    saveButton.classList.add('btn-loading');
                    await new Promise(resolve => setTimeout(resolve, 1000));
    
                    const updatedData = {
                        idCat: categoryData.idCat,
                        designation: designation.value.trim()
                    };
    
                    const response = await fetch(`http://localhost:8086/category/${categoryData.idCat}`, 
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

    async function deleteCategory(row) {
        const designation = row.querySelector('.name').textContent;
        const idCat = row.querySelector('.id').textContent;
    
        // Wait for user confirmation before proceeding with the deletion
        const confirmation = await showConfirmDialog({
            title: 'Confirmer la suppression',
            message: `Êtes-vous sûr de vouloir supprimer la categorie "${designation}" ?`,
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'warning'
        });
    
        // If user confirmed, proceed with the deletion
        if (confirmation) {
            try {
                const response = await fetch(`http://localhost:8086/category/${idCat}`,
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
    
    // Actions sur la category
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            switch(action) {
                case 'edit':
                    editCategory(this.closest('tr'));
                    break;
                case 'delete':
                    deleteCategory(this.closest('tr'));
                    break;
            }
        });
    });
    initializeModal();
});
