/// CAREER PATH ///

// Create the SVG element with a viewBox to make it responsive
var svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", "0 0 960 200")
    .attr("preserveAspectRatio", "xMidYMid meet");

// Define the total width for the line
var totalLineWidth = 700; // Adjust the total length of the line
var startX = 125; // Starting point of the line

// Define the positions of the circles along the timeline
var positions = [
    { year: "2007 - 2011", description: "Assistant Researcher \n at Hasselt University \n Belgium" },
    { year: "2011 - 2014", description: "Postdoctoral Researcher \n at Karolinska Institutet \n Stockholm, Sweden" },
    { year: "2018 - 2022", description: "Big Data Team Lead \n at Directorate of Statistical \n Analysis and Development" },
    { year: "2014 - Now", description: "Professor of Statistics \n at Polytechnic of Statistics \n STIS Jakarta" }
];

// Calculate spacing between bubbles
var bubbleSpacing = totalLineWidth / (positions.length - 1);

// Add a line (horizontal line across the timeline)
svg.append("line")
    .attr("x1", startX)
    .attr("y1", 100)
    .attr("x2", startX + totalLineWidth)  // Line extends across the entire calculated length
    .attr("y2", 100)
    .attr("stroke-width", 2)
    .attr("stroke", "white");

// Add circles and labels
positions.forEach(function (d, i) {
    var xPosition = startX + (i * bubbleSpacing);  // Calculate x position based on spacing

    svg.append("circle")
        .attr("cx", xPosition)
        .attr("cy", 100)
        .attr("r", i === positions.length - 1 ? 20 : 10)  // Larger circle for the last one
        .attr("fill", i === positions.length - 1 ? "#fdbb05" : "white");

    // Add year label
    svg.append("text")
        .attr("x", xPosition)
        .attr("y", 140)
        .attr("font-size", "16px")
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .text(d.year)
        .style("font-weight", i === positions.length - 1 ? "bold" : "normal");

    // Add description label with two lines
    svg.append("text")
        .attr("x", xPosition)
        .attr("y", 160)
        .attr("font-size", "14px")
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .selectAll("tspan")
        .data(d.description.split("\n"))
        .enter()
        .append("tspan")
        .attr("x", xPosition)
        .attr("dy", function (_, i) { return i === 0 ? "0em" : "1.2em"; }) // Adjust line spacing
        .text(function (line) { return line; });
});

/// CHART ///

let barChart, doughnutChart, stackedBarChart, guideDoughnutChart, reviewerBarChart, reviewerDoughnutChart;
let dataTable1Instance, dataTable2Instance, guideTableInstance, reviewerTableInstance;

fetch('assets/material.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        let workbook = XLSX.read(data, { type: 'array' });

        // Proses untuk tabel 1 dan chart terkait
        let firstSheet1 = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData1 = XLSX.utils.sheet_to_json(firstSheet1, { header: 1 });

        let yearCount1 = {};
        let typeCount1 = {};

        let tableData1 = [];

        jsonData1.forEach((row, index) => {
            if (index > 0) { // Skip header
                let type = row[0];
                let writer = row[1];
                let year = row[2];
                let publication = row[3];

                if (year !== undefined && !isNaN(year)) {
                    if (yearCount1[year]) {
                        yearCount1[year]++;
                    } else {
                        yearCount1[year] = 1;
                    }
                } else {
                    console.warn(`Invalid or undefined year at row ${index + 1}:`, row);
                }

                if (type !== undefined && typeof type === 'string') {
                    if (typeCount1[type]) {
                        typeCount1[type]++;
                    } else {
                        typeCount1[type] = 1;
                    }
                } else {
                    console.warn(`Invalid or undefined type at row ${index + 1}:`, row);
                }

                tableData1.push([writer, year, publication]);
            }
        });

        createBarChart(yearCount1);
        createDoughnutChart(typeCount1);
        createTable1(tableData1);

        // Proses untuk tabel 2 dan chart terkait
        let firstSheet2 = workbook.Sheets[workbook.SheetNames[5]];
        let jsonData2 = XLSX.utils.sheet_to_json(firstSheet2, { header: 1 });

        let tableData2 = [];
        let treemapData = { name: "root", children: [] };
        let subjectMap = {};

        jsonData2.forEach((row, index) => {
            if (index > 0) { // Skip header
                let subject = row[0];

                if (subject !== undefined && typeof subject === 'string') {
                    if (!subjectMap[subject]) {
                        subjectMap[subject] = { name: subject, value: 1 };
                    } else {
                        subjectMap[subject].value += 1;
                    }
                }

                tableData2.push([subject, row[4], row[1], row[2], row[3]]); // Menyimpan data tabel
            }
        });

        treemapData.children = Object.values(subjectMap);
        createTreemap(treemapData);
        createTable2(tableData2);

        // Proses untuk sheet "guide"
        let guideSheet = workbook.Sheets['guide'];
        let jsonDataGuide = XLSX.utils.sheet_to_json(guideSheet, { header: 1 });

        let yearCount2 = {};
        let levelCount2 = {};
        let tableData3 = [];

        jsonDataGuide.forEach((row, index) => {
            if (index > 0) { // Skip header
                let year = row[0];
                let level = row[1];
                let studentName = row[2];
                let researchTitle = row[3];
                let institution = row[4];
                let position = row[5];

                // Stacked Bar Chart Data (by Year)
                if (year !== undefined && !isNaN(year)) {
                    if (!yearCount2[year]) {
                        yearCount2[year] = {};
                    }
                    if (level !== undefined && typeof level === 'string') {
                        if (!yearCount2[year][level]) {
                            yearCount2[year][level] = 1;
                        } else {
                            yearCount2[year][level]++;
                        }
                    }
                }

                // Doughnut Chart Data (by Level)
                if (level !== undefined && typeof level === 'string') {
                    if (!levelCount2[level]) {
                        levelCount2[level] = 1;
                    } else {
                        levelCount2[level]++;
                    }
                }

                // Tabel Data
                tableData3.push([studentName, year, researchTitle, institution, position]);
            }
        });

        createStackedBarChart(yearCount2);
        createDoughnutChartForGuide(levelCount2);
        createGuideTable(tableData3);

        // Proses untuk sheet reviewer
        let reviewerSheet = workbook.Sheets['reviewer'];
        let jsonDataReviewer = XLSX.utils.sheet_to_json(reviewerSheet, { header: 1 });

        let yearCountReviewer = {};
        let rankingCountReviewer = {};

        let tableDataReviewer = [];

        jsonDataReviewer.forEach((row, index) => {
            if (index > 0) { // Skip header
                let journalName = row[0];
                let year = row[1];
                let ranking = row[2];
                let link = row[3];
                let country = row[4];

                if (year !== undefined && !isNaN(year)) {
                    if (yearCountReviewer[year]) {
                        yearCountReviewer[year]++;
                    } else {
                        yearCountReviewer[year] = 1;
                    }
                } else {
                    console.warn(`Invalid or undefined year at row ${index + 1}:`, row);
                }

                if (ranking !== undefined && typeof ranking === 'string') {
                    if (rankingCountReviewer[ranking]) {
                        rankingCountReviewer[ranking]++;
                    } else {
                        rankingCountReviewer[ranking] = 1;
                    }
                } else {
                    console.warn(`Invalid or undefined ranking at row ${index + 1}:`, row);
                }

                tableDataReviewer.push([journalName, year, ranking, link, country]);
            }
        });

        createReviewerBarChart(yearCountReviewer);
        createReviewerDoughnutChart(rankingCountReviewer);
        createReviewerTable(tableDataReviewer);
    })
    .catch(error => console.error('Error fetching data:', error));

function createBarChart(yearCount) {
    if (barChart) {
        barChart.destroy();
    }

    const labels = Object.keys(yearCount);
    const data = Object.values(yearCount);

    var ctx = document.getElementById('myChart').getContext('2d');

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribution of Publications by Year',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createDoughnutChart(typeCount) {
    if (doughnutChart) {
        doughnutChart.destroy();
    }

    const labels = Object.keys(typeCount);
    const data = Object.values(typeCount);

    var ctx = document.getElementById('doughnutChart').getContext('2d');

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Publication Count by Type',
                data: data,
                backgroundColor: [
                    'rgba(255, 0, 0, 0.2)',
                    'rgba(0, 128, 128, 0.2)',
                    'rgba(255, 255, 0, 0.2)',
                    'rgba(255, 20, 147, 0.2)',
                    'rgba(138, 43, 226, 0.2)',
                    'rgba(255, 165, 0, 0.2)',
                    'rgba(0, 255, 255, 0.2)',
                    'rgba(139, 69, 19, 0.2)',
                    'rgba(50, 205, 50, 0.2)',
                    'rgba(255, 105, 180, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 0, 0, 0.2)',
                    'rgba(0, 128, 128, 0.2)',
                    'rgba(255, 255, 0, 0.2)',
                    'rgba(255, 20, 147, 0.2)',
                    'rgba(138, 43, 226, 0.2)',
                    'rgba(255, 165, 0, 0.2)',
                    'rgba(0, 255, 255, 0.2)',
                    'rgba(139, 69, 19, 0.2)',
                    'rgba(50, 205, 50, 0.2)',
                    'rgba(255, 105, 180, 0.2)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                }
            }
        }
    });
}

function createStackedBarChart(yearCount) {
    if (stackedBarChart) {
        stackedBarChart.destroy();
    }

    const labels = Object.keys(yearCount);
    const levels = Array.from(new Set(Object.values(yearCount).flatMap(obj => Object.keys(obj))));

    const colorMap = {
        "Level 1": "rgba(255, 0, 0, 0.4)",
        "Level 2": "rgba(54, 162, 235, 0.4)",
        "Level 3": "rgba(255, 206, 86, 0.4)",
        "Level 4": "rgba(255, 99, 132, 0.4)",
        "Level 5": "rgba(75, 192, 192, 0.4)",
        "Level 6": "rgba(153, 102, 255, 0.4)"
    };

    const datasets = levels.map(level => {
        return {
            label: level,
            data: labels.map(year => yearCount[year][level] || 0),
            backgroundColor: colorMap[level]
        };
    });

    var ctx = document.getElementById('stackedBarChart').getContext('2d');

    stackedBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    beginAtZero: true,
                    stacked: true
                }
            }
        }
    });
}

function createDoughnutChartForGuide(levelCount) {
    if (guideDoughnutChart) {
        guideDoughnutChart.destroy();
    }

    const labels = Object.keys(levelCount);
    const data = Object.values(levelCount);

    var ctx = document.getElementById('guideDoughnutChart').getContext('2d');

    guideDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Level Distribution',
                data: data,
                backgroundColor: [
                    'rgba(255, 0, 0, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function createTable1(tableData) {
    if (dataTable1Instance) {
        dataTable1Instance.destroy();
    }

    dataTable1Instance = $('#dataTable1').DataTable({
        data: tableData,
        columns: [
            { title: "Writer" },
            { title: "Year" },
            { title: "Publication" }
        ],
        searching: true,
        autoWidth: false,
        columnDefs: [
            { width: "45%", targets: 0 },
            { width: "5%", targets: 1 },
            { width: "50%", targets: 2 }
        ]
    });
}

function createTable2(tableData) {
    if (dataTable2Instance) {
        dataTable2Instance.destroy();
    }

    dataTable2Instance = $('#dataTable2').DataTable({
        data: tableData,
        columns: [
            { title: "Subject" },
            { title: "Year" },
            { title: "Major" },
            { title: "Institution" },
            { title: "Country" }
        ],
        searching: true,
        autoWidth: false,
        columnDefs: [
            { width: "25%", targets: 0 },
            { width: "15%", targets: 1 },
            { width: "20%", targets: 2 },
            { width: "20%", targets: 3 },
            { width: "20%", targets: 4 }
        ]
    });
}

function createGuideTable(tableData) {
    if (guideTableInstance) {
        guideTableInstance.destroy();
    }

    guideTableInstance = $('#guideTable').DataTable({
        data: tableData,
        columns: [
            { title: "Student Name" },
            { title: "Year" },
            { title: "Research Title" },
            { title: "Institution" },
            { title: "Position" }
        ],
        searching: true,
        autoWidth: false,
        columnDefs: [
            { width: "20%", targets: 0 },
            { width: "10%", targets: 1 },
            { width: "40%", targets: 2 },
            { width: "20%", targets: 3 },
            { width: "10%", targets: 4 }
        ]
    });
}

function createReviewerBarChart(yearCount) {
    if (reviewerBarChart) {
        reviewerBarChart.destroy();
    }

    const labels = Object.keys(yearCount);
    const data = Object.values(yearCount);

    var ctx = document.getElementById('reviewerBarChart').getContext('2d');

    reviewerBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribution of Reviewers by Year',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createReviewerDoughnutChart(rankingCount) {
    if (reviewerDoughnutChart) {
        reviewerDoughnutChart.destroy();
    }

    const labels = Object.keys(rankingCount);
    const data = Object.values(rankingCount);

    var ctx = document.getElementById('reviewerDoughnutChart').getContext('2d');

    reviewerDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reviewers by Ranking',
                data: data,
                backgroundColor: [
                    'rgba(0, 123, 255, 0.2)',  // Biru Muda
                    'rgba(220, 53, 69, 0.2)',  // Merah Terang
                    'rgba(40, 167, 69, 0.2)',  // Hijau Cerah
                    'rgba(255, 193, 7, 0.2)',  // Kuning Cerah
                    'rgba(108, 117, 125, 0.2)' // Abu-abu

                ],
                borderColor: [
                    'rgba(0, 123, 255, 0.2)',  // Biru Muda
                    'rgba(220, 53, 69, 0.2)',  // Merah Terang
                    'rgba(40, 167, 69, 0.2)',  // Hijau Cerah
                    'rgba(255, 193, 7, 0.2)',  // Kuning Cerah
                    'rgba(108, 117, 125, 0.2)' // Abu-abu

                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function createReviewerTable(tableData) {
    if (reviewerTableInstance) {
        reviewerTableInstance.destroy();
    }

    reviewerTableInstance = $('#reviewerTable').DataTable({
        data: tableData,
        columns: [
            { title: "Journal Name" },
            { title: "Year" },
            { title: "Ranking" },
            { title: "Link" },
            { title: "Country" }
        ],
        searching: true,
        autoWidth: false,
        columnDefs: [
            { width: "30%", targets: 0 },
            { width: "10%", targets: 1 },
            { width: "20%", targets: 2 },
            { width: "20%", targets: 3 },
            { width: "20%", targets: 4 }
        ]
    });
}

function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createTreemap(data) {
    const container = d3.select("#treemap").node();
    const width = container.getBoundingClientRect().width;
    const height = container.getBoundingClientRect().height;

    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    d3.treemap()
        .size([width, height])
        .padding(1)
        (root);

    const svg = d3.select("#treemap")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMinYMin meet");

    const colorScale = d3.scaleOrdinal([
        '#1F77B4',
        '#FF7F0E',
        '#2CA02C',
        '#D62728',
        '#9467BD',
        '#8C564B',
        '#E377C2',
        '#7F7F7F',
        '#BCBD22',
        '#17BECF',
        '#393B79',
        '#637939',
        '#8C6D31',
        '#843C39',
        '#7B4173',
        '#5254A3',
        '#9C9EDE',
        '#8C564B',
        '#E7BA52',
        '#AD494A'
    ]);

    const node = svg.selectAll(".node")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    node.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .style("fill", d => colorScale(d.data.name));

    node.append("text")
        .attr("x", 3)
        .attr("y", 10)
        .attr("dy", ".35em")
        .attr("font-size", d => Math.min(10, (d.y1 - d.y0) / 4) + "px")
        .text(d => {
            const maxLength = Math.floor((d.x1 - d.x0) / 7);
            return d.data.name.length > maxLength ? d.data.name.substring(0, maxLength) + "..." : d.data.name;
        })
        .attr("fill", "white")
        .attr("title", d => d.data.name);
}
