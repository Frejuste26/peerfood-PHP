// Configuration avancée
const CONFIG = {
    colors: {
        primary: getComputedStyle(document.documentElement).getPropertyValue('--orange-300'),
        secondary: getComputedStyle(document.documentElement).getPropertyValue('--blue-300'),
        success: getComputedStyle(document.documentElement).getPropertyValue('--green-300'),
        warning: getComputedStyle(document.documentElement).getPropertyValue('--yellow-300'),
        danger: getComputedStyle(document.documentElement).getPropertyValue('--red-300'),
        background: getComputedStyle(document.documentElement).getPropertyValue('--gray-100'),
    },
    animations: {
        duration: 1000,
        easing: d3.easeCubicOut
    },
    chart: {
        margin: { top: 20, right: 30, bottom: 30, left: 60 },
        height: 400,
        tooltipOffset: 12
    }
};

// Gestionnaire des onglets
class TabManager {
    constructor() {
        this.tabs = document.querySelectorAll('.view-tab');
        this.init();
    }

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });
    }

    switchTab(selectedTab) {
        this.tabs.forEach(tab => {
            tab.classList.remove('active');
            const view = document.querySelector(`[data-view-content="${tab.dataset.view}"]`);
            if (view) view.style.display = 'none';
        });

        selectedTab.classList.add('active');
        const activeView = document.querySelector(`[data-view-content="${selectedTab.dataset.view}"]`);
        if (activeView) {
            activeView.style.display = 'block';
            this.animateViewContent(activeView);
        }
    }

    animateViewContent(view) {
        const elements = view.querySelectorAll('.animate-on-view');
        elements.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(() => {
                el.style.transition = 'all 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }
}

// Gestionnaire des graphiques
class ChartManager {
    constructor() {
        this.charts = {};
        this.initCharts();
        this.setupEventListeners();
    }

    initCharts() {
        this.charts.sales = this.createSalesChart();
        this.charts.distribution = this.createDistributionChart();
        this.charts.forecast = this.createForecastChart();
        this.charts.trends = this.createTrendChart();
    }

    setupEventListeners() {
        // Gestion des contrôles de graphique
        document.querySelectorAll('.chart-type-selector button').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeChartType(e));
        });

        // Export des graphiques
        document.querySelectorAll('[data-chart-export]').forEach(btn => {
            btn.addEventListener('click', (e) => this.exportChart(e));
        });

        // Plein écran
        document.querySelectorAll('[data-chart-fullscreen]').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleFullscreen(e));
        });
    }

    // Méthodes pour les différents types de graphiques...
    createSalesChart() {
        // Implémentation du graphique des ventes
    }

    createDistributionChart() {
        // Implémentation du graphique de distribution
    }

    createForecastChart() {
        // Implémentation du graphique de prévision
    }

    createTrendChart() {
        // Implémentation du graphique des tendances
    }

    // Méthodes utilitaires
    exportChart(e) {
        const chartId = e.target.closest('[data-chart-export]').dataset.chartExport;
        const svg = document.querySelector(`#${chartId} svg`);
        // Logique d'export...
    }

    toggleFullscreen(e) {
        const chartContainer = e.target.closest('.card');
        if (!document.fullscreenElement) {
            chartContainer.requestFullscreen();
            this.handleFullscreenChange(chartContainer);
        } else {
            document.exitFullscreen();
        }
    }

    handleFullscreenChange(container) {
        // Redimensionner et réajuster le graphique en plein écran
    }
}

// Gestionnaire des filtres
class FilterManager {
    constructor() {
        this.setupDateRangePicker();
        this.setupFilterSaving();
        this.setupResponsiveFilters();
    }

    setupDateRangePicker() {
        const dateInputs = document.querySelectorAll('.date-range-picker input');
        dateInputs.forEach(input => {
            input.addEventListener('change', () => this.handleDateChange());
        });
    }

    setupFilterSaving() {
        const saveBtn = document.getElementById('saveFilters');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCurrentFilters());
        }
    }

    setupResponsiveFilters() {
        // Gestion des filtres en mode responsive
    }

    handleDateChange() {
        // Mise à jour des graphiques selon la date
    }

    saveCurrentFilters() {
        // Sauvegarde des filtres actuels
        this.showNotification('Filtres sauvegardés avec succès');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Gestionnaire des insights
class InsightManager {
    constructor() {
        this.setupInsightActions();
        this.initializeInsightAnimations();
    }

    setupInsightActions() {
        document.querySelectorAll('.insight-action').forEach(action => {
            action.addEventListener('click', (e) => this.handleInsightAction(e));
        });
    }

    initializeInsightAnimations() {
        const insights = document.querySelectorAll('.insight-card');
        this.animateInsights(insights);
    }

    animateInsights(insights) {
        insights.forEach((insight, index) => {
            setTimeout(() => {
                insight.classList.add('show');
            }, index * 200);
        });
    }

    handleInsightAction(e) {
        // Gestion des actions sur les insights
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const tabManager = new TabManager();
    const chartManager = new ChartManager();
    const filterManager = new FilterManager();
    const insightManager = new InsightManager();

    // Animation des stats cards
    animateStatCards();
});

// Fonction pour animer les stats cards
function animateStatCards() {
    const cards = document.querySelectorAll('.stats-card');
    cards.forEach((card, index) => {
        const value = card.querySelector('h3');
        const target = parseFloat(value.dataset.target);
        animateValue(value, 0, target, 2000);
    });
}

// Fonction pour animer les valeurs
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const animate = () => {
        current += increment;
        element.textContent = current.toFixed(1);
        
        if (current < end) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = end;
        }
    };
    
    animate();
}

// Graphique d'évolution des ventes annuelles
function initAnnualSalesChart() {
    const margin = {top: 20, right: 30, bottom: 30, left: 60};
    const width = document.getElementById('annualSalesChart').offsetWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#annualSalesChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Données de démonstration
    const data = generateMonthlySalesData();

    // Échelles
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.1])
        .range([height, 0]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .ticks(width > 600 ? 10 : 5)
            .tickFormat(d3.timeFormat("%b %Y")));

    svg.append("g")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d => `${d}k€`));

    // Ligne
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    // Aire sous la courbe
    const area = d3.area()
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX);

    // Ajout de l'aire
    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("fill", `${CONFIG.colors.primary}20`)
        .attr("d", area);

    // Ajout de la ligne
    const path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", CONFIG.colors.primary)
        .attr("stroke-width", 2)
        .attr("d", line);

    // Animation de la ligne
    const pathLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(CONFIG.animations.duration)
        .attr("stroke-dashoffset", 0);

    // Points et tooltip
    const tooltip = d3.select("#annualSalesChart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 4)
        .attr("fill", CONFIG.colors.primary)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(CONFIG.animations.duration)
                .attr("r", 6);

            tooltip.transition()
                .duration(CONFIG.animations.duration)
                .style("opacity", .9);
            
            tooltip.html(`
                <div class="tooltip-date">${d3.timeFormat("%B %Y")(d.date)}</div>
                <div class="tooltip-value">${d.value}k€</div>
                <div class="tooltip-change ${d.change >= 0 ? 'positive' : 'negative'}">
                    ${d.change >= 0 ? '+' : ''}${d.change}% vs mois précédent
                </div>
            `)
            .style("left", (event.pageX + CONFIG.chart.tooltipOffset) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(CONFIG.animations.duration)
                .attr("r", 4);

            tooltip.transition()
                .duration(CONFIG.animations.duration)
                .style("opacity", 0);
        });

    // Gestion du changement de type de graphique
    document.querySelectorAll('.chart-type-selector button').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            updateChartType(type, svg, data, x, y, height);
            
            // Mise à jour de l'état actif des boutons
            document.querySelectorAll('.chart-type-selector button').forEach(btn => 
                btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Graphique de répartition des ventes
function initSalesDistributionChart() {
    const width = document.getElementById('salesDistributionChart').offsetWidth;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#salesDistributionChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    // Données de démonstration
    const data = [
        {name: "Produit A", value: 30},
        {name: "Produit B", value: 25},
        {name: "Produit C", value: 20},
        {name: "Produit D", value: 15},
        {name: "Autres", value: 10}
    ];

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range([CONFIG.colors.primary, CONFIG.colors.secondary, CONFIG.colors.success, CONFIG.colors.warning, "#e0e0e0"]);

    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(radius * 0.6) // Pour créer un donut
        .outerRadius(radius * 0.8);

    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    // Ajout des sections
    const paths = svg.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.name))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .style('opacity', 0.7);

    // Animation
    paths.transition()
        .duration(CONFIG.animations.duration)
        .attrTween('d', function(d) {
            const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });

    // Légende
    const legend = d3.select('.chart-legend')
        .append('div')
        .attr('class', 'distribution-legend')
        .style('display', 'flex')
        .style('flex-wrap', 'wrap')
        .style('gap', '10px');

    legend.selectAll('div')
        .data(data)
        .enter()
        .append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('gap', '5px')
        .html(d => `
            <span style="
                width: 12px;
                height: 12px;
                background: ${color(d.name)};
                display: inline-block;
                border-radius: 2px;
            "></span>
            <span>${d.name} (${d.value}%)</span>
        `);
}

// Graphique des prévisions de croissance
function initGrowthForecastChart() {
    const margin = {top: 20, right: 30, bottom: 30, left: 60};
    const width = document.getElementById('growthForecastChart').offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#growthForecastChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Données de prévision
    const data = generateForecastData();

    // Échelles
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([
            d3.min(data, d => Math.min(d.actual, d.forecast, d.lower, d.upper)) * 0.9,
            d3.max(data, d => Math.max(d.actual, d.forecast, d.lower, d.upper)) * 1.1
        ])
        .range([height, 0]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Zone de confiance
    const area = d3.area()
        .x(d => x(d.date))
        .y0(d => y(d.lower))
        .y1(d => y(d.upper));

    svg.append("path")
        .datum(data.filter(d => d.forecast))
        .attr("fill", `${CONFIG.colors.primary}20`)
        .attr("d", area);

    // Ligne des valeurs réelles
    const actualLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.actual));

    svg.append("path")
        .datum(data.filter(d => d.actual))
        .attr("fill", "none")
        .attr("stroke", CONFIG.colors.primary)
        .attr("stroke-width", 2)
        .attr("d", actualLine);

    // Ligne de prévision
    const forecastLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.forecast));

    svg.append("path")
        .datum(data.filter(d => d.forecast))
        .attr("fill", "none")
        .attr("stroke", CONFIG.colors.secondary)
        .attr("stroke-dasharray", "5,5")
        .attr("stroke-width", 2)
        .attr("d", forecastLine);
}

// Graphique d'analyse des tendances
function initTrendAnalysisChart() {
    const margin = {top: 20, right: 30, bottom: 30, left: 60};
    const width = document.getElementById('trendAnalysisChart').offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#trendAnalysisChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Données de tendance
    const data = generateTrendData();

    // Échelles
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([
            d3.min(data, d => Math.min(d.value, d.trend, d.seasonal)) * 0.9,
            d3.max(data, d => Math.max(d.value, d.trend, d.seasonal)) * 1.1
        ])
        .range([height, 0]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Ligne des valeurs réelles
    const valueLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", CONFIG.colors.primary)
        .attr("stroke-width", 2)
        .attr("d", valueLine);

    // Ligne de tendance
    const trendLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.trend));

    const trendPath = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", CONFIG.colors.secondary)
        .attr("stroke-width", 2)
        .attr("d", trendLine)
        .style("opacity", 1);

    // Ligne saisonnière
    const seasonalLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.seasonal));

    const seasonalPath = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", CONFIG.colors.success)
        .attr("stroke-width", 2)
        .attr("d", seasonalLine)
        .style("opacity", 1);

    // Gestion des checkboxes
    document.querySelector('input[label="Tendance"]').addEventListener('change', function() {
        trendPath.style("opacity", this.checked ? 1 : 0);
    });

    document.querySelector('input[label="Saisonnalité"]').addEventListener('change', function() {
        seasonalPath.style("opacity", this.checked ? 1 : 0);
    });
}

// Fonctions utilitaires pour générer les données
function generateMonthlySalesData() {
    const now = new Date();
    const data = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = Math.round(50 + Math.random() * 50);
        const change = i === 11 ? 0 : ((value - data[data.length-1].value) / data[data.length-1].value * 100).toFixed(1);
        data.push({date, value, change});
    }
    return data;
}

function generateForecastData() {
    const now = new Date();
    const data = [];
    // Données historiques
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
            date,
            actual: Math.round(100 + Math.random() * 20),
            forecast: null,
            lower: null,
            upper: null
        });
    }
    // Prévisions
    const lastActual = data[data.length-1].actual;
    for (let i = 1; i <= 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const forecast = lastActual * (1 + (Math.random() * 0.1));
        const margin = forecast * 0.1;
        data.push({
            date,
            actual: null,
            forecast,
            lower: forecast - margin,
            upper: forecast + margin
        });
    }
    return data;
}

function generateTrendData() {
    const now = new Date();
    const data = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const trend = 100 + (11-i) * 5;
        const seasonal = trend + Math.sin((11-i) * Math.PI / 6) * 20;
        const value = seasonal + (Math.random() - 0.5) * 10;
        data.push({date, value, trend, seasonal});
    }
    return data;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initAnnualSalesChart();
    initSalesDistributionChart();
    initGrowthForecastChart();
    initTrendAnalysisChart();

    // Gestion du redimensionnement
    window.addEventListener('resize', debounce(function() {
        // Nettoyer et réinitialiser tous les graphiques
        document.querySelectorAll('.chart-container').forEach(container => {
            container.innerHTML = '';
        });
        initAnnualSalesChart();
        initSalesDistributionChart();
        initGrowthForecastChart();
        initTrendAnalysisChart();
    }, 250));
});

// Utilitaire pour limiter les appels lors du redimensionnement
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 