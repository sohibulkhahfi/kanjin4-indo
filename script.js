    const container = document.getElementById('cardsContainer');
  const toggle = document.getElementById('toggleHiragana');
  const listContainer = document.getElementById('listKanji');
  const cards = [];

  // Muat data dari localStorage
  let selectedKanji = JSON.parse(localStorage.getItem('selectedKanji') || '{}');

  function getUniqueKey(item) {
  return `${item.kana}__${item.kanji || '-' }__${item.indonesia}`;
}

  function renderCards(filteredData = data) {
      if (!Array.isArray(filteredData)) {
    console.error("❌ filteredData is not an array:", filteredData);
    return;
  }
  
  container.innerHTML = '';
  cards.length = 0;
  filteredData.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      const inner = document.createElement('div');
      inner.className = 'card-inner';

      const front = document.createElement('div');
      front.className = 'card-front';
const kanjiDisplay = item.kanji ? item.kanji : item.kana;
front.innerHTML = `
  <div class="kanji">${kanjiDisplay}</div>
  ${toggle.checked && item.kanji ? `<div class="hiragana">${item.kana}</div>` : ''}
`;

      const back = document.createElement('div');
      back.className = 'card-back';
      back.innerHTML = `
        ${!toggle.checked ? `<div class="hiragana">${item.kana}</div>` : ''}
        <div>${item.indonesia}</div>
      `;

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      // Tandai jika termasuk kanji terpilih
const key = getUniqueKey(item);
if (selectedKanji[key]) {
  card.classList.add('selected');
  front.style.background = "#b2f2bb";
  back.style.background = "#b2f2bb";
}



      card.addEventListener('click', () => {
        cards.forEach(c => {
          if (c !== card) c.classList.remove('flipped');
        });
        card.classList.toggle('flipped');
        if (!card.classList.contains('flipped')) return;

const textEl = card.querySelector('.hiragana') || card.querySelector('.kanji');
if (textEl) {
  const text = textEl.textContent.trim();
  speakSentence(text);
}
      });

      container.appendChild(card);
      cards.push(card);
    });
}

function renderList(filteredData = data) {
  listContainer.innerHTML = '';
  filteredData.forEach(item => {
      const div = document.createElement('div');
const key = getUniqueKey(item);
div.innerHTML = `
  <label>
    <input type="checkbox" ${selectedKanji[key] ? 'checked' : ''} 
      onchange="toggleKanji('${item.kanji}', this.checked, '${item.kana}', '${item.indonesia}')">
    ${item.kanji || item.kana}（${item.kana}） - ${item.indonesia}
  </label>
`;
      listContainer.appendChild(div);
    });
}




window.toggleKanji = function(kanji, isChecked, kana, indonesia) {
  const key = `${kana}__${kanji || '-'}__${indonesia}`;
  selectedKanji[key] = isChecked;
  if (!isChecked) delete selectedKanji[key];
  localStorage.setItem('selectedKanji', JSON.stringify(selectedKanji));
  renderCards();
}


toggle.addEventListener('change', () => renderCards());


  function speakSentence(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }

  function showMenu(menu) {
    document.querySelector('.flipkanji').style.display = (menu === 'flipkanji') ? 'block' : 'none';
    document.querySelector('.listkanji').style.display = (menu === 'listkanji') ? 'block' : 'none';
  }

function getAllTypes(data) {
  const typesSet = new Set();
  data.forEach(item => {
    if (item.type) {
      item.type.split(',').forEach(type => {
        const t = type.trim();
        if (t) typesSet.add(t);
      });
    }
  });
  return Array.from(typesSet).sort();
}
function populateTypeFilter() {
  const select = document.getElementById('typeFilter');
  select.innerHTML = ''; // bersihkan sebelum isi ulang

  // Tambahkan opsi "Semua"
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Semua';
  select.appendChild(allOption);

  // Tambahkan opsi "Disimpan / Favorit"
  const selectedOption = document.createElement('option');
  selectedOption.value = 'selected';
  selectedOption.textContent = 'Yang Disimpan';
  select.appendChild(selectedOption);

  // Tambahkan semua type dari data
  const types = getAllTypes(data);
  types.forEach(typeCode => {
    const option = document.createElement('option');
    option.value = typeCode;
    option.textContent = typeMap[typeCode] || typeCode;
    select.appendChild(option);
  });
}

function filterByType() {
  const selectedType = document.getElementById('typeFilter').value;

  let filteredData;
  if (selectedType === 'all') {
    filteredData = data;
  } else if (selectedType === 'selected') {
    // Gunakan getUniqueKey() untuk memastikan key cocok dengan yang disimpan
    filteredData = data.filter(item => {
      const key = getUniqueKey(item);
      return selectedKanji[key];
    });
  } else {
    filteredData = data.filter(item =>
      item.type &&
      item.type.split(',').map(t => t.trim()).includes(selectedType)
    );
  }

  renderCards(filteredData);
  renderList(filteredData);
}

renderCards();
renderList();
populateTypeFilter();