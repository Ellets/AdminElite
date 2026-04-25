// Function to update the datalist for product names
function updateProductList(rows) {
    const datalist = document.getElementById('existing-products');
    const typeSelect = document.getElementById('p_type_select');
    
    // Clear current options
    datalist.innerHTML = '';
    
    // We use a Set to ensure unique values
    const productNames = new Set();
    const categories = new Set();

    rows.forEach(row => {
        const name = row.c[1]?.v;
        const category = row.c[4]?.v;
        if (name) productNames.add(name);
        if (category) categories.add(category);
    });

    // Populate Product Datalist
    productNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
    });

    // Populate Category Select (limiting repetition)
    typeSelect.innerHTML = '<option value="">-- اختر --</option><option value="NEW">+ تصنيف جديد</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        typeSelect.appendChild(option);
    });
}

// Updated loadInventory to trigger the list update
async function loadInventory() {
    const fetchURL = `https://docs.google.com/spreadsheets/d/${inventorySheetID}/gviz/tq?tqx=out:json`;
    try {
        const res = await fetch(fetchURL);
        const text = await res.text();
        const json = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        const rows = json.table.rows.slice(1); // Skip header
        
        // Update the dropdowns and datalists
        updateProductList(rows);

        const tbody = document.getElementById('inventory-body');
        tbody.innerHTML = '';
        rows.forEach(row => {
            const data = row.c;
            tbody.innerHTML += `<tr>
                <td><img src="${formatDriveUrl(data[5]?.v)}" class="p-img-mini"></td>
                <td><div class="p-info"><span class="p-name">${data[1]?.v || '-'}</span><span class="badge">${data[4]?.v || 'عام'}</span></div></td>
                <td class="order-total">${data[2]?.v}</td>
                <td><b>${data[3]?.v}</b></td>
            </tr>`;
        });
    } catch (e) { console.error("Error fetching data", e); }
}

// Automatically load inventory when the page opens to populate the lists
window.onload = loadInventory;
