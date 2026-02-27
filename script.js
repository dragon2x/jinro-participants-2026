const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXZOlGc9WKp1EDUH3t3MrYRrrSEXrVUjKQz-rjvsj-u0uVYLr_028JGW7TUG8ZxLSmkQ/exec';

let teacherCount = 0;
const MAX_TEACHERS = 8;

document.addEventListener('DOMContentLoaded', () => {
  addTeacher();
  document.getElementById('addTeacherBtn').addEventListener('click', addTeacher);
  document.getElementById('mainForm').addEventListener('submit', handleSubmit);
  document.getElementById('taPhone').addEventListener('input', (e) => {
    e.target.value = formatPhone(e.target.value);
  });
  document.getElementById('taId').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });
});

function addTeacher() {
  if (teacherCount >= MAX_TEACHERS) return;
  teacherCount++;
  const list = document.getElementById('teacherList');
  const row = document.createElement('div');
  row.className = 'teacher-row';
  row.dataset.index = teacherCount;
  row.innerHTML =
    '<div class="teacher-num" style="grid-column:1/-1">교원 ' + teacherCount + '</div>' +
    '<div><span class="sub-label">교원명 <span class="required">*</span></span>' +
    '<input type="text" class="field-input t-name" placeholder="홍길동" maxlength="20" />' +
    '<span class="error-msg t-name-err"></span></div>' +
    '<div><span class="sub-label">사번 <span class="required">*</span></span>' +
    '<input type="text" class="field-input t-id" placeholder="2024123456" maxlength="20" inputmode="numeric" />' +
    '<span class="error-msg t-id-err"></span></div>' +
    '<div><span class="sub-label">연락처 <span class="required">*</span></span>' +
    '<input type="tel" class="field-input t-phone" placeholder="010-1234-5678" maxlength="13" inputmode="numeric" />' +
    '<span class="error-msg t-phone-err"></span></div>' +
    '<button type="button" class="btn-delete" title="삭제">&#10005;</button>';
  row.querySelector('.btn-delete').addEventListener('click', () => {
    row.remove(); reindexTeachers(); updateAddBtn();
  });
  row.querySelector('.t-phone').addEventListener('input', (e) => {
    e.target.value = formatPhone(e.target.value);
  });
  row.querySelector('.t-id').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });
  list.appendChild(row);
  updateAddBtn();
  clearError('err-teachers');
}

function reindexTeachers() {
  const rows = document.querySelectorAll('.teacher-row');
  teacherCount = rows.length;
  rows.forEach((row, i) => {
    row.dataset.index = i + 1;
    row.querySelector('.teacher-num').textContent = '교원 ' + (i + 1);
  });
}

function updateAddBtn() {
  const btn = document.getElementById('addTeacherBtn');
  const rows = document.querySelectorAll('.teacher-row').length;
  btn.disabled = rows >= MAX_TEACHERS;
  btn.textContent = rows >= MAX_TEACHERS
    ? '교원 추가 불가 (최대 ' + MAX_TEACHERS + '명)'
    : '+ 교원 추가';
}

function formatPhone(val) {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return digits.slice(0,3) + '-' + digits.slice(3);
  return digits.slice(0,3) + '-' + digits.slice(3,7) + '-' + digits.slice(7);
}

function validate() {
  let valid = true;
  const required = [
    { id: 'taName',    errId: 'err-taName',    label: '담당 조교명을 입력해 주세요.' },
    { id: 'taId',      errId: 'err-taId',      label: '사번을 입력해 주세요.' },
    { id: 'taPhone',   errId: 'err-taPhone',   label: '연락처를 입력해 주세요.' },
    { id: 'trackName', errId: 'err-trackName', label: '트랙명을 입력해 주세요.' },
  ];
  required.forEach(({ id, errId, label }) => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { showError(errId, label); el.classList.add('error'); valid = false; }
    else { clearError(errId); el.classList.remove('error'); }
  });
  const phoneEl = document.getElementById('taPhone');
  if (phoneEl.value && !/^\d{3}-\d{3,4}-\d{4}$/.test(phoneEl.value)) {
    showError('err-taPhone', '연락처 형식을 확인해 주세요. (예: 010-1234-5678)');
    phoneEl.classList.add('error'); valid = false;
  }
  const rows = document.querySelectorAll('.teacher-row');
  if (rows.length === 0) { showError('err-teachers', '교원을 1명 이상 입력해 주세요.'); valid = false; }
  else { clearError('err-teachers'); }
  rows.forEach((row) => {
    const nameEl = row.querySelector('.t-name');
    const idEl   = row.querySelector('.t-id');
    const pEl    = row.querySelector('.t-phone');
    const nErr   = row.querySelector('.t-name-err');
    const iErr   = row.querySelector('.t-id-err');
    const pErr   = row.querySelector('.t-phone-err');
    if (!nameEl.value.trim()) { nErr.textContent = '교원명을 입력해 주세요.'; nameEl.classList.add('error'); valid = false; }
    else { nErr.textContent = ''; nameEl.classList.remove('error'); }
    if (!idEl.value.trim()) { iErr.textContent = '사번을 입력해 주세요.'; idEl.classList.add('error'); valid = false; }
    else { iErr.textContent = ''; idEl.classList.remove('error'); }
    if (!pEl.value.trim()) { pErr.textContent = '연락처를 입력해 주세요.'; pEl.classList.add('error'); valid = false; }
    else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(pEl.value)) { pErr.textContent = '연락처 형식을 확인해 주세요.'; pEl.classList.add('error'); valid = false; }
    else { pErr.textContent = ''; pEl.classList.remove('error'); }
  });
  return valid;
}

function showError(id, msg) { document.getElementById(id).textContent = msg; }
function clearError(id) { document.getElementById(id).textContent = ''; }

async function handleSubmit(e) {
  e.preventDefault();
  if (!validate()) return;
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '제출 중...';
  const data = {
    taName: document.getElementById('taName').value.trim(),
    taId: document.getElementById('taId').value.trim(),
    taPhone: document.getElementById('taPhone').value.trim(),
    trackName: document.getElementById('trackName').value.trim(),
    teachers: [],
  };
  document.querySelectorAll('.teacher-row').forEach((row) => {
    data.teachers.push({
      name: row.querySelector('.t-name').value.trim(),
      id: row.querySelector('.t-id').value.trim(),
      phone: row.querySelector('.t-phone').value.trim(),
    });
  });
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.status === 'ok') {
      document.getElementById('modal').classList.remove('hidden');
    } else {
      throw new Error(result.message || '서버 오류');
    }
  } catch (err) {
    alert('제출 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.\n\n오류: ' + err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = '제출하기';
  }
}
