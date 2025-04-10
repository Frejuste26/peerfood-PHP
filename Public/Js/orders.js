document.addEventListener('DOMContentLoaded', function() {
    // Initialisation du date picker
        $('#dateRange').daterangepicker({
        locale: {
            format: 'DD/MM/YYYY',
            applyLabel: 'Appliquer',
            cancelLabel: 'Annuler',
            fromLabel: 'Du',
            toLabel: 'Au',
            customRangeLabel: 'Période personnalisée',
            daysOfWeek: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
            monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        },
        ranges: {
            'Aujourd\'hui': [moment(), moment()],
            'Hier': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '7 derniers jours': [moment().subtract(6, 'days'), moment()],
            '30 derniers jours': [moment().subtract(29, 'days'), moment()],
            'Ce mois': [moment().startOf('month'), moment().endOf('month')],
            'Mois dernier': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: moment().subtract(29, 'days'),
        endDate: moment()
    }, function(start, end) {
        updateDateRange(start, end);
    });

    // Gestion des vues (tableau/grille)
    const viewModeBtn = document.querySelector('[data-action="view-mode"]');
    let currentView = 'table';

    viewModeBtn.addEventListener('click', () => {
        currentView = currentView === 'table' ? 'grid' : 'table';
        toggleView(currentView);
    });

    // Gestion des filtres
    const searchInput = document.querySelector('.search-box input');
    const statusFilter = document.querySelector('select[data-filter="status"]');
    const resetButton = document.querySelector('[data-action="reset-filters"]');
    const tableRows = document.querySelectorAll('tbody tr');

    // Fonction pour filtrer les commandes
    function filterOrders() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value.toLowerCase();

        tableRows.forEach(row => {
            const orderNumber = row.querySelector('.order-number').textContent.toLowerCase();
            const clientName = row.querySelector('.client-info h6').textContent.toLowerCase();
            const status = row.querySelector('.badge').textContent.toLowerCase();
            const date = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            const total = row.querySelector('td:nth-child(5)').textContent.toLowerCase();

            // Vérifier si la ligne correspond aux critères de recherche
            const matchesSearch = !searchTerm || 
                orderNumber.includes(searchTerm) ||
                clientName.includes(searchTerm) ||
                status.includes(searchTerm) ||
                date.includes(searchTerm) ||
                total.includes(searchTerm);

            // Vérifier si la ligne correspond au filtre de statut
            const matchesStatus = !selectedStatus || status.includes(selectedStatus);

            // Afficher ou masquer la ligne
            row.style.display = matchesSearch && matchesStatus ? '' : 'none';

            // Ajouter une animation à la ligne si elle est visible
            if (matchesSearch && matchesStatus) {
                row.style.animation = 'fadeIn 0.5s ease forwards';
            }
        });

        // Mettre à jour le compteur de résultats
        updateResultsCount();
    }

    // Fonction pour mettre à jour le compteur de résultats
    function updateResultsCount() {
        const visibleRows = document.querySelectorAll('tbody tr:not([style*="display: none"])').length;
        const totalRows = tableRows.length;
        
        // Mettre à jour les statistiques si nécessaire
        const totalCounter = document.querySelector('.stat-card:first-child .counter');
        if (totalCounter) {
            totalCounter.textContent = visibleRows;
        }
    }

    // Écouteur d'événement pour la recherche (avec debounce)
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterOrders, 300);

        // Ajouter une classe active à la barre de recherche
        searchInput.classList.add('active');
    });

    // Écouteur d'événement pour le filtre de statut
    statusFilter.addEventListener('change', () => {
        filterOrders();
        
        // Ajouter une classe active au select
        statusFilter.classList.add('active');
    });

    // Fonction de réinitialisation des filtres
    function resetFilters() {
        // Réinitialiser la recherche
        searchInput.value = '';
        searchInput.classList.remove('active');

        // Réinitialiser le filtre de statut
        statusFilter.value = '';
        statusFilter.classList.remove('active');

        // Réinitialiser l'affichage des lignes
        tableRows.forEach(row => {
            row.style.display = '';
            row.style.animation = 'fadeIn 0.5s ease forwards';
        });

        // Mettre à jour le compteur
        updateResultsCount();

        // Animation du bouton de réinitialisation
        resetButton.classList.add('rotating');
        setTimeout(() => {
            resetButton.classList.remove('rotating');
        }, 500);

        // Afficher une notification
        showNotification('Filtres réinitialisés', 'success');
    }

    // Écouteur d'événement pour le bouton de réinitialisation
    resetButton.addEventListener('click', resetFilters);

    // Animation du bouton de réinitialisation au survol
    resetButton.addEventListener('mouseenter', () => {
        const icon = resetButton.querySelector('svg');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }
    });

    resetButton.addEventListener('mouseleave', () => {
        const icon = resetButton.querySelector('svg');
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }
    });

    // Fonction pour afficher une notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${getNotificationIcon(type)}
            </div>
            <div class="notification-content">
                <p>${message}</p>
                <div class="notification-progress"></div>
            </div>
        `;

        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Fonction pour obtenir l'icône de notification
    function getNotificationIcon(type) {
        const icons = {
            success: '<svg>...</svg>', // Ajouter les SVG appropriés
            error: '<svg>...</svg>',
            warning: '<svg>...</svg>',
            info: '<svg>...</svg>'
        };
        return icons[type] || icons.info;
    }

    // Animation pour les lignes du tableau
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'translateX(5px)';
            const actions = row.querySelector('.actions');
            if (actions) {
                actions.style.opacity = '1';
            }
        });

        row.addEventListener('mouseleave', () => {
            row.style.transform = 'translateX(0)';
            const actions = row.querySelector('.actions');
            if (actions) {
                actions.style.opacity = '0.7';
            }
        });
    });

    // Gestion des actions en masse
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('tbody .form-check-input');

    selectAllCheckbox.addEventListener('change', () => {
        checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
        updateBulkActions();
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectAll();
            updateBulkActions();
        });
    });

    // Gestion des actions sur les commandes
    document.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (!action) return;

        const row = e.target.closest('tr');
        switch(action) {
            case 'view':
                viewOrder(row);
                break;
            case 'edit':
                editOrder(row);
                break;
            case 'delete':
                deleteOrder(row);
                break;
            case 'export-orders':
                exportOrders();
                break;
            case 'add-order':
                showOrderModal();
                break;
            case 'refresh':
                refreshData();
                break;
        }
    });

    // Fonctions utilitaires
    function updateDateRange(start, end) {
        const display = document.getElementById('dateRange');
        display.value = `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
        applyFilters();
    }

    function toggleView(view) {
        const container = document.querySelector('.table-responsive');
        if (view === 'grid') {
            container.innerHTML = createGridView();
        } else {
            container.innerHTML = createTableView();
        }
        // Réinitialiser les écouteurs d'événements après le changement de vue
        initializeEventListeners();
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const filters = {};
        filterSelects.forEach(select => {
            if (select.value) {
                filters[select.dataset.filter] = select.value;
            }
        });

        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            let show = true;
            
            // Filtre de recherche
            if (searchTerm) {
                const text = row.textContent.toLowerCase();
                show = text.includes(searchTerm);
            }

            // Filtres de sélection
            if (show && Object.keys(filters).length) {
                show = Object.entries(filters).every(([key, value]) => {
                    const cell = row.querySelector(`[data-${key}]`);
                    return cell && cell.dataset[key] === value;
                });
            }

            row.style.display = show ? '' : 'none';
        });
    }

    async function deleteOrder(row) {
        const orderNumber = row.querySelector('.order-number').textContent;
        
        const confirmed = await showConfirmDialog({
            title: 'Confirmer la suppression',
            message: `Êtes-vous sûr de vouloir supprimer la commande ${orderNumber} ?`,
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await animateRowDeletion(row);
                showNotification('Commande supprimée avec succès', 'success');
            } catch (error) {
                showNotification('Erreur lors de la suppression', 'error');
            }
        }
    }

    function refreshData() {
        const refreshBtn = document.querySelector('[data-action="refresh"]');
        refreshBtn.classList.add('rotating');
        
        // Simuler un rechargement des données
        setTimeout(() => {
            refreshBtn.classList.remove('rotating');
            showNotification('Données actualisées', 'success');
        }, 1000);
    }

    // Autres fonctions utilitaires (showNotification, animateRowDeletion, etc.)
    // ... (réutiliser les fonctions similaires du fichier clients.js)

    function showOrderModal(orderData = null) {
        const modal = document.getElementById('orderModal');
        const modalTitle = modal.querySelector('.modal-title');
        const form = modal.querySelector('form');
        
        // Mise à jour du titre selon le mode
        modalTitle.textContent = orderData ? 'Modifier la commande' : 'Nouvelle commande';
        
        if (orderData) {
            // Pré-remplir le formulaire en mode édition
            Object.entries(orderData).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'select-one') {
                        input.value = value;
                    } else {
                        input.value = value;
                    }
                }
            });
        }

        // Initialiser le sélecteur de client avec autocomplétion
        initializeClientSelect();
        
        // Initialiser le sélecteur de produits multiple
        initializeProductSelect();
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function initializeClientSelect() {
        const clientSelect = document.getElementById('orderClient');
        
        $(clientSelect).select2({
            placeholder: 'Rechercher un client...',
            minimumInputLength: 2,
            ajax: {
                url: '/api/clients/search',
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        q: params.term
                    };
                },
                processResults: function (data) {
                    return {
                        results: data.map(client => ({
                            id: client.id,
                            text: `${client.name} (${client.email})`
                        }))
                    };
                },
                cache: true
            }
        });
    }

    function initializeProductSelect() {
        const productSelect = document.getElementById('orderProducts');
        
        $(productSelect).select2({
            placeholder: 'Sélectionner les produits...',
            multiple: true,
            minimumInputLength: 1,
            ajax: {
                url: '/api/products/search',
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        q: params.term
                    };
                },
                processResults: function (data) {
                    return {
                        results: data.map(product => ({
                            id: product.id,
                            text: `${product.name} - ${product.price}€`
                        }))
                    };
                },
                cache: true
            }
        }).on('select2:select', updateOrderTotal)
          .on('select2:unselect', updateOrderTotal);
    }

    function updateOrderTotal() {
        const selectedProducts = $(orderProducts).select2('data');
        let total = 0;
        
        selectedProducts.forEach(product => {
            const price = parseFloat(product.text.split('-')[1]);
            const quantity = document.querySelector(`[data-product-id="${product.id}"]`)?.value || 1;
            total += price * quantity;
        });
        
        document.getElementById('orderTotal').textContent = `${total.toFixed(2)}€`;
    }

    function createQuantityControls(productId) {
        return `
            <div class="quantity-controls" data-product-id="${productId}">
                <button type="button" class="btn btn-sm" data-action="decrease">-</button>
                <input type="number" min="1" value="1" class="form-control form-control-sm">
                <button type="button" class="btn btn-sm" data-action="increase">+</button>
            </div>
        `;
    }

    function viewOrder(row) {
        const orderNumber = row.querySelector('.order-number').textContent;
        const orderDetails = {
            // Simuler la récupération des détails de la commande
            number: orderNumber,
            client: row.querySelector('.client-info h6').textContent,
            date: row.querySelector('td:nth-child(4)').textContent,
            total: row.querySelector('td:nth-child(5)').textContent,
            status: row.querySelector('.badge').textContent
        };
        
        showOrderDetailsModal(orderDetails);
    }

    function showOrderDetailsModal(details) {
        const modal = document.createElement('div');
        modal.className = 'modal order-details-modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de la commande ${details.number}</h5>
                        <button type="button" class="modal-close" data-dismiss="modal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="order-info">
                            <div class="info-group">
                                <label>Client</label>
                                <p>${details.client}</p>
                            </div>
                            <div class="info-group">
                                <label>Date</label>
                                <p>${details.date}</p>
                            </div>
                            <div class="info-group">
                                <label>Total</label>
                                <p>${details.total}</p>
                            </div>
                            <div class="info-group">
                                <label>Statut</label>
                                <p><span class="badge ${details.status.toLowerCase()}">${details.status}</span></p>
                            </div>
                        </div>
                        <div class="order-timeline">
                            <!-- Timeline des événements de la commande -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 50);

        modal.addEventListener('click', e => {
            if (e.target === modal || e.target.closest('[data-dismiss="modal"]')) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    function exportOrders() {
        const selectedRows = Array.from(document.querySelectorAll('tbody tr:not([style*="display: none"])'));
        const data = selectedRows.map(row => ({
            number: row.querySelector('.order-number').textContent,
            client: row.querySelector('.client-info h6').textContent,
            date: row.querySelector('td:nth-child(4)').textContent,
            total: row.querySelector('td:nth-child(5)').textContent,
            status: row.querySelector('.badge').textContent
        }));

        const csv = convertToCSV(data);
        downloadCSV(csv, `commandes_export_${moment().format('YYYY-MM-DD')}.csv`);
        showNotification('Export réussi', 'success');
    }

    // Remplacer la gestion du dropdown par une fonction d'export simple
    document.querySelector('[data-action="export-excel"]').addEventListener('click', async function() {
        try {
            this.classList.add('loading'); // Ajouter un état de chargement
            
            const selectedRows = Array.from(document.querySelectorAll('tbody tr:not([style*="display: none"])'));
            const data = selectedRows.map(row => ({
                number: row.querySelector('.order-number').textContent,
                client: row.querySelector('.client-info h6').textContent,
                date: row.querySelector('td:nth-child(4)').textContent,
                total: row.querySelector('td:nth-child(5)').textContent,
                status: row.querySelector('.badge').textContent
            }));

            // Simuler un délai de traitement
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Fonction d'export Excel (à implémenter selon vos besoins)
            downloadExcel(data, `commandes_${moment().format('YYYY-MM-DD')}.xlsx`);
            
            showNotification('Export Excel réussi', 'success');
        } catch (error) {
            showNotification('Erreur lors de l\'export', 'error');
        } finally {
            this.classList.remove('loading');
        }
    });

    // Gestion de la vue (tableau/grille)
    const viewButtons = document.querySelectorAll('.view-switcher .btn-icon');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            
            // Mettre à jour les boutons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Changer la vue
            toggleView(view);
            
            // Sauvegarder la préférence
            localStorage.setItem('ordersViewPreference', view);
        });
    });

    // Animation du bouton refresh
    const refreshButton = document.querySelector('[data-action="refresh"]');
    refreshButton.addEventListener('click', async () => {
        refreshButton.classList.add('spinning');
        
        try {
            await refreshData();
            showNotification('Données actualisées avec succès', 'success');
        } catch (error) {
            showNotification('Erreur lors de l\'actualisation', 'error');
        } finally {
            setTimeout(() => {
                refreshButton.classList.remove('spinning');
            }, 1000);
        }
    });

    // Initialiser la vue préférée au chargement
    document.addEventListener('DOMContentLoaded', () => {
        const preferredView = localStorage.getItem('ordersViewPreference') || 'table';
        const viewButton = document.querySelector(`[data-view="${preferredView}"]`);
        if (viewButton) {
            viewButton.click();
        }
    });

    // Rendre la toolbar sticky avec une animation fluide
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const toolbar = document.querySelector('.filters-toolbar');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            toolbar.style.transform = 'translateY(-100%)';
        } else {
            toolbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });

    // Gestion du modal d'ajout/modification de commande
    function initializeOrderModal() {
        const addOrderBtn = document.querySelector('[data-action="add-order"]');
        const modal = document.getElementById('orderModal');
        const closeButtons = modal.querySelectorAll('[data-dismiss="modal"]');
        const saveButton = document.getElementById('saveOrder');
        const form = document.getElementById('orderForm');

        // Initialisation de Select2 pour le client
        $('#orderClient').select2({
            dropdownParent: modal,
            ajax: {
                url: '/api/clients/search',
                dataType: 'json',
                delay: 250,
                data: function(params) {
                    return {
                        search: params.term
                    };
                },
                processResults: function(data) {
                    return {
                        results: data.map(client => ({
                            id: client.id,
                            text: `${client.name} (${client.email})`
                        }))
                    };
                },
                cache: true
            },
            minimumInputLength: 2,
            placeholder: 'Rechercher un client...'
        });

        // Initialisation de Select2 pour les produits
        $('#orderProducts').select2({
            dropdownParent: modal,
            ajax: {
                url: '/api/products/search',
                dataType: 'json',
                delay: 250,
                data: function(params) {
                    return {
                        search: params.term
                    };
                },
                processResults: function(data) {
                    return {
                        results: data.map(product => ({
                            id: product.id,
                            text: product.name,
                            price: product.price
                        }))
                    };
                },
                cache: true
            },
            minimumInputLength: 2,
            placeholder: 'Rechercher des produits...'
        }).on('select2:select', handleProductSelection)
          .on('select2:unselect', handleProductUnselection);

        // Ouverture du modal
        addOrderBtn.addEventListener('click', () => {
            openModal();
        });

        // Fermeture du modal
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                closeModal();
            });
        });

        // Enregistrement de la commande
        saveButton.addEventListener('click', async () => {
            if (validateForm()) {
                await saveOrder();
            }
        });

        // Fermeture du modal en cliquant en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Gestion des produits sélectionnés
    function handleProductSelection(e) {
        const product = e.params.data;
        const container = document.getElementById('productsContainer');
        
        const productElement = document.createElement('div');
        productElement.className = 'selected-product';
        productElement.dataset.productId = product.id;
        productElement.innerHTML = `
            <div class="product-info">
                <span class="product-name">${product.text}</span>
                <span class="product-price">${product.price} €</span>
            </div>
            <div class="quantity-controls">
                <button type="button" class="btn btn-sm" data-action="decrease">-</button>
                <input type="number" min="1" value="1" class="form-control form-control-sm quantity" name="quantities[${product.id}]">
                <button type="button" class="btn btn-sm" data-action="increase">+</button>
            </div>
        `;

        container.appendChild(productElement);
        updateTotal();

        // Gestion des quantités
        const quantityInput = productElement.querySelector('.quantity');
        const decreaseBtn = productElement.querySelector('[data-action="decrease"]');
        const increaseBtn = productElement.querySelector('[data-action="increase"]');

        decreaseBtn.addEventListener('click', () => {
            if (quantityInput.value > 1) {
                quantityInput.value--;
                updateTotal();
            }
        });

        increaseBtn.addEventListener('click', () => {
            quantityInput.value++;
            updateTotal();
        });

        quantityInput.addEventListener('change', () => {
            if (quantityInput.value < 1) quantityInput.value = 1;
            updateTotal();
        });
    }

    function handleProductUnselection(e) {
        const productId = e.params.data.id;
        const productElement = document.querySelector(`.selected-product[data-product-id="${productId}"]`);
        if (productElement) {
            productElement.remove();
            updateTotal();
        }
    }

    function updateTotal() {
        let total = 0;
        const products = document.querySelectorAll('.selected-product');
        
        products.forEach(product => {
            const price = parseFloat(product.querySelector('.product-price').textContent);
            const quantity = parseInt(product.querySelector('.quantity').value);
            total += price * quantity;
        });

        document.getElementById('orderTotal').textContent = `${total.toFixed(2)} €`;
    }

    function validateForm() {
        const form = document.getElementById('orderForm');
        const client = document.getElementById('orderClient').value;
        const products = document.getElementById('orderProducts').value;

        if (!client) {
            showNotification('Veuillez sélectionner un client', 'error');
            return false;
        }

        if (!products || products.length === 0) {
            showNotification('Veuillez sélectionner au moins un produit', 'error');
            return false;
        }

        return true;
    }

    async function saveOrder() {
        const saveButton = document.getElementById('saveOrder');
        const form = document.getElementById('orderForm');
        const formData = new FormData(form);

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Enregistrement...
            `;

            // Simuler un appel API
            await new Promise(resolve => setTimeout(resolve, 1000));

            showNotification('Commande enregistrée avec succès', 'success');
            closeModal();
            refreshData(); // Rafraîchir la liste des commandes
        } catch (error) {
            showNotification('Erreur lors de l\'enregistrement', 'error');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Enregistrer';
        }
    }

    function openModal() {
        const modal = document.getElementById('orderModal');
        document.body.style.overflow = 'hidden';
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 50);
    }

    function closeModal() {
        const modal = document.getElementById('orderModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            resetForm();
        }, 300);
    }

    function resetForm() {
        const form = document.getElementById('orderForm');
        form.reset();
        $('#orderClient').val(null).trigger('change');
        $('#orderProducts').val(null).trigger('change');
        document.getElementById('productsContainer').innerHTML = '';
        document.getElementById('orderTotal').textContent = '0.00 €';
    }

    // Initialiser le modal au chargement de la page
    document.addEventListener('DOMContentLoaded', initializeOrderModal);
}); 