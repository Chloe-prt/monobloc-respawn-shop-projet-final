let btnModals = document.querySelectorAll('.btn-modal');
let modals = document.querySelectorAll('.modal-option');
let openIndex = -1;

btnModals.forEach((btn, i) => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        modals.forEach((modal) => modal.classList.add('hidden'));
        modals[i].classList.remove('hidden');
        openIndex = i;
    });
});

document.addEventListener('click', (e) => {
    if (openIndex === -1) return;

    const isClickInsideModal = modals[openIndex].contains(e.target);
    const isClickOnButton = btnModals[openIndex].contains(e.target);

    if (!isClickInsideModal && !isClickOnButton) {
        modals[openIndex].classList.add('hidden');
        openIndex = -1;
    }
});


const labels = document.querySelectorAll('.label-update');
const inputs = document.querySelectorAll('.input-update');

let activeInputIndex = -1; 

labels.forEach((label, index) => {
    label.addEventListener('click', () => {
        if (activeInputIndex !== -1) {
            inputs[activeInputIndex].classList.add('hidden');
        }

        inputs[index].classList.remove('hidden');
        activeInputIndex = index; 
    });
});

const messagesList = document.getElementById('messagesList');
if (messagesList) {
    messagesList.scrollTop = messagesList.scrollHeight;
}
