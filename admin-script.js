const sheetID = '12XnQD1ne4fu7Q56v-RVzFVMFDCY4p18C22pzyBsBoeg';
const fetchURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;
const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSd_m0-myPMPCQzZJNrT8ip4mi-D0oVTh6o_mX2b9NSlz7RIIg/formResponse";

// Fetch existing types from Sheet
async function loadCategories() {
    try {
        const res = await fetch(fetchURL);
        const text = await res.text();
        const json = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        const rows = json.table.rows;

        const categories = [...new Set(rows.map(r => r.c[4]?.v).filter(v => v && v !== "Type"))];
        
        const select = document.getElementById('p_type_select');
        select.innerHTML = '<option value="">-- اختر تصنيفاً --</option>';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.innerText = cat;
            select.appendChild(option);
        });
        document.getElementById('type-loader').innerText = "تم تحديث التصنيفات ✓";
    } catch (e) {
        document.getElementById('type-loader').innerText = "خطأ في جلب البيانات.";
    }
}

// Toggle between select and manual input
function toggleNewType() {
    const input = document.getElementById('new-type-input');
    const select = document.getElementById('p_type_select');
    if (input.style.display === 'block') {
        input.style.display = 'none';
        select.disabled = false;
    } else {
        input.style.display = 'block';
        select.disabled = true;
        input.focus();
    }
}

// Handle Form Submission
document.getElementById('adminApiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('msg');
    
    const selectedType = document.getElementById('p_type_select').value;
    const newType = document.getElementById('new-type-input').value;
    const finalType = newType || selectedType;

    if (!finalType) {
        msg.style.color = "#e74c3c";
        msg.innerText = "يرجى تحديد التصنيف!";
        return;
    }

    btn.disabled = true;
    msg.innerText = "جاري الحفظ في السحابة...";

    const formData = new URLSearchParams();
    formData.append("entry.1904055406", document.getElementById('p_name').value);
    formData.append("entry.372117537",  document.getElementById('p_price').value);
    formData.append("entry.663866375",  document.getElementById('p_qty').value);
    formData.append("entry.307919813",  finalType);
    formData.append("entry.174446568",  document.getElementById('p_img').value);

    try {
        await fetch(formURL, { method: "POST", mode: "no-cors", body: formData });
        msg.style.color = "var(--success)";
        msg.innerText = "تم الحفظ بنجاح! ✓";
        document.getElementById('adminApiForm').reset();
        document.getElementById('new-type-input').style.display = 'none';
        document.getElementById('p_type_select').disabled = false;
        loadCategories();
    } catch (error) {
        msg.style.color = "#e74c3c";
        msg.innerText = "حدث خطأ في الإرسال.";
    } finally {
        btn.disabled = false;
    }
});

// Run on load
loadCategories();
