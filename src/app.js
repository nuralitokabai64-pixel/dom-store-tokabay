const store = new Store([
  { name: 'Щит дубовый 20мм (кв.м)', price: 35000, qty: 8 },
  { name: 'Профиль металлический 40х40', price: 4200, qty: 24 },
  { name: 'Масло-воск OSMO (0.75л)', price: 18500, qty: 5 },
  { name: 'Саморезы черные 35мм (упак)', price: 1200, qty: 15 },
  { name: 'Опора для стола "Трапеция"', price: 12000, qty: 4 }
]);

const form = document.getElementById('addProductForm');
const nameInput = document.getElementById('productName');
const priceInput = document.getElementById('productPrice');
const qtyInput = document.getElementById('productQty');

const nameError = document.getElementById('nameError');
const priceError = document.getElementById('priceError');
const qtyError = document.getElementById('qtyError');

const productsTableBody = document.getElementById('productsTableBody');
const emptyState = document.getElementById('emptyState');
const liveTotalEl = document.getElementById('liveTotal');
const itemsCountEl = document.getElementById('itemsCount');
const totalUnitsEl = document.getElementById('totalUnits');
const formSuccessMsg = document.getElementById('formSuccessMsg');
const rowTemplate = document.getElementById('rowTemplate');

function parseStrictPrice(val) {
  const clean = val.replace(/\s+/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return NaN;
  return parseFloat(clean);
}

function parseStrictQty(val) {
  const clean = val.replace(/\s+/g, '');
  if (!/^\d+$/.test(clean)) return NaN;
  return parseInt(clean, 10);
}

function validateForm() {
  let isValid = true;

  const nameVal = nameInput.value.trim();
  if (!nameVal) {
    nameError.textContent = 'ОШИБКА: ПУСТОЕ ПОЛЕ';
    nameInput.classList.add('invalid');
    isValid = false;
  }

  const priceVal = parseStrictPrice(priceInput.value);
  if (isNaN(priceVal) || priceVal <= 0) {
    priceError.textContent = 'ОШИБКА: НЕВЕРНЫЙ ФОРМАТ ЦЕНЫ';
    priceInput.classList.add('invalid');
    isValid = false;
  } else if (priceVal > 10000000) {
    priceError.textContent = 'ПРЕВЫШЕН ЛИМИТ ЦЕНЫ';
    priceInput.classList.add('invalid');
    isValid = false;
  }

  const qtyVal = parseStrictQty(qtyInput.value);
  if (isNaN(qtyVal) || qtyVal < 1) {
    qtyError.textContent = 'ОШИБКА: МИН. КОЛ-ВО 1';
    qtyInput.classList.add('invalid');
    isValid = false;
  } else if (qtyVal > 9999) {
    qtyError.textContent = 'ЛИМИТ 9999 ШТ.';
    qtyInput.classList.add('invalid');
    isValid = false;
  }

  return isValid ? { name: nameVal, price: priceVal, qty: qtyVal } : null;
}

function render() {
  const items = store.list();
  productsTableBody.innerHTML = '';

  if (items.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');

    items.forEach(({ name, price, qty }) => {
      const clone = rowTemplate.content.cloneNode(true);
      
      clone.querySelector('.cell-name').textContent = name;
      clone.querySelector('.cell-price').textContent = `${price.toLocaleString('ru-RU')} ₸`;
      clone.querySelector('.val').textContent = qty;
      clone.querySelector('.cell-sum').textContent = `${(price * qty).toLocaleString('ru-RU')} ₸`;

      const decBtn = clone.querySelector('[data-action="dec"]');
      const incBtn = clone.querySelector('[data-action="inc"]');
      const delBtn = clone.querySelector('[data-action="delete"]');

      decBtn.dataset.name = name;
      incBtn.dataset.name = name;
      delBtn.dataset.name = name;

      if (qty >= 9999) incBtn.disabled = true;

      productsTableBody.appendChild(clone);
    });
  }

  liveTotalEl.textContent = `${store.total().toLocaleString('ru-RU')} ₸`;
  itemsCountEl.textContent = store.count;
  totalUnitsEl.textContent = store.totalUnits();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = validateForm();
  if (data) {
    store.add(data);
    form.reset();
    qtyInput.value = '1';
    
    formSuccessMsg.textContent = `ПРИХОД ОФОРМЛЕН: ${data.name}`;
    formSuccessMsg.classList.remove('hidden');
    setTimeout(() => formSuccessMsg.classList.add('hidden'), 3000);
    render();
  }
});

form.addEventListener('input', (e) => {
  if (e.target.tagName === 'INPUT') {
    e.target.classList.remove('invalid');
    const errorEl = document.getElementById(`${e.target.name}Error`);
    if (errorEl) errorEl.textContent = '';
  }
});

productsTableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  const name = btn.dataset.name;
  if (!action || !name) return;

  const currentItem = store.list().find((i) => i.name === name);
  if (!currentItem) return;

  if (action === 'inc') store.update(name, currentItem.qty + 1);
  else if (action === 'dec') store.update(name, currentItem.qty - 1);
  else if (action === 'delete') store.remove(name);
  render();
});

render();