const inventorySheetID = '12XnQD1ne4fu7Q56v-RVzFVMFDCY4p18C22pzyBsBoeg';
const ordersSheetID = '1hCfKFp2-YvEl33FdU7gEJyzxRoSO3l9bPHCDMn58W9o';
const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSd_m0-myPMPCQzZJNrT8ip4mi-D0oVTh6o_mX2b9NSlz7RIIg/formResponse";

// UI Helpers
function checkNewType(val) { 
    document.getElementById('new_type_container').style.display = (val === 'NEW') ? 'block' : 'none'; 
}

function formatDriveUrl(url) {
    if (!url) return 'https://via.placeholder.com/40';
    if (url.includes('drive.google.com')) {
        const fileId = url.match(/[-\w]{25,}/);
        if (fileId) return `https://lh3.googleusercontent.com/d/${fileId[0]}`;
    }
    return url;
}

function openTab(evt, tabName) {
    let contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) contents[i].style.display = "none";
    let btns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < btns.length; i++) btns[i].classList.remove("active");
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
    if(tabName === 'inventory-tab') loadInventory();
    if(tabName === 'orders-tab') loadOrders();
}

// Data Handling
async function loadInventory() {
    const fetchURL = `https://docs.google.com/spreadsheets/d/${inventorySheetID}/gviz/tq?tqx=out:json`;
    try {
        const res = await fetch(fetchURL);
        const text = await res.text();
        const json = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        const rows = json.table.rows.slice(1);
        
        // Populate the name datalist and category dropdown
        const datalist = document.getElementById('existing-products');
        const typeSelect = document.getElementById('p_type_select');
        const names = new Set();
        const cats = new Set();
        
        datalist.innerHTML = '';
        const tbody = document.getElementById('inventory-body');
        tbody.innerHTML = '';

        rows.forEach(row => {
            const data = row.c;
            if (data[1]?.v) names.add(data[1].v);
            if (data[4]?.v) cats.add(data[4].v);

            tbody.innerHTML += `<tr>
                <td><img src="${formatDriveUrl(data[5]?.v)}" class="p-img-mini"></td>
                <td><div class="p-info"><span class="p-name">${data[1]?.v || '-'}</span><span class="badge">${data[4]?.v || 'عام'}</span></div></td>
                <td class="order-total">${data[2]?.v}</td>
                <td><b>${data[3]?.v}</b></td>
            </tr>`;
        });

        names.forEach(n => datalist.innerHTML += `<option value="${n}">`);
        typeSelect.innerHTML = '<option value="">-- اختر --</option><option value="NEW">+ تصنيف جديد</option>';
        cats.forEach(c => typeSelect.innerHTML += `<option value="${c}">${c}</option>`);

    } catch (e) { console.error(e); }
}

async function loadOrders() {
    const fetchURL = `https://docs.google.com/spreadsheets/d/${ordersSheetID}/gviz/tq?tqx=out:json`;
    try {
        const res = await fetch(fetchURL);
        const text = await res.text();
        const json = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        const tbody = document.getElementById('orders-body');
        tbody.innerHTML = '';
        json.table.rows.reverse().slice(0, 15).forEach(row => {
            const data = row.c;
            const phone = String(data[4]?.v || '');
            tbody.innerHTML += `<tr>
                <td><div class="p-info"><span class="p-name">${data[2]?.v || 'زبون'}</span><span class="badge" style="font-size:0.6rem">${data[3]?.v || '-'}</span></div></td>
                <td><div style="font-size:0.7rem; color:#a0aec0">${data[6]?.v || '-'}</div><div class="order-total">${data[7]?.v} د.ع</div></td>
                <td>
                    <div class="contact-actions">
                        <a href="tel:${phone}" class="contact-link"><i class="fas fa-phone-alt"></i></a>
                        <a href="https://wa.me/${phone.replace(/\D/g,'')}" class="contact-link"><i class="fab fa-whatsapp"></i></a>
                    </div>
                </td>
            </tr>`;
        });
    } catch (e) {}
}

document.getElementById('adminApiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('msg');
    btn.disabled = true; msg.innerText = "جاري الحفظ...";

    let finalType = document.getElementById('p_type_select').value;
    if(finalType === 'NEW') finalType = document.getElementById('p_new_type').value;

    const formData = new URLSearchParams();
    formData.append("entry.1904055406", document.getElementById('p_name').value);
    formData.append("entry.372117537",  document.getElementById('p_price').value);
    formData.append("entry.663866375",  document.getElementById('p_qty').value);
    formData.append("entry.307919813",  finalType);
    formData.append("entry.174446568",  document.getElementById('p_img').value);

    try {
        await fetch(formURL, { method: "POST", mode: "no-cors", body: formData });
        msg.style.color = "var(--gold-primary)"; msg.innerText = "تم الحفظ بنجاح! ✓";
        document.getElementById('adminApiForm').reset();
        loadInventory(); // Refresh lists
    } catch (error) { msg.innerText = "حدث خطأ"; }
    finally { btn.disabled = false; }
});

// Initialization
document.getElementById('edit-inventory-link').href = `https://docs.google.com/spreadsheets/d/${inventorySheetID}/edit`;
document.getElementById('edit-orders-link').href = `https://docs.google.com/spreadsheets/d/${ordersSheetID}/edit`;
loadInventory();
